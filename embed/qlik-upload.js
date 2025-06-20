// Qlik Cloud App Upload & Publish
// Usage: node embed/qlik-upload.js

const fs = require("fs");
const path = require("path");
const glob = require("glob");
const { apps, items, spaces, auth } = require("@qlik/api");

const tenant = process.env.QLIK_TENANT_HOST;
const clientId = process.env.QLIK_CLIENT_ID;
const clientSecret = process.env.QLIK_CLIENT_SECRET;

if (!tenant || !clientId || !clientSecret) {
  console.error("Missing Qlik Cloud environment variables.");
  process.exit(1);
}

const hostConfig = {
  authType: "oauth2",
  host: tenant,
  clientId,
  clientSecret,
  scope: "admin_classic user_default",
};

auth.setDefaultHostConfig(hostConfig);

async function getOrCreateSpace(spaceName, spaceType) {
  if (!["shared", "managed"].includes(spaceType)) {
    throw new Error('Invalid space type. Only "shared" or "managed" allowed.');
  }
  const response = await spaces.getSpaces({
    name: spaceName,
    type: spaceType,
    limit: 1,
  });
  const spaceArr = response?.data?.data;
  if (Array.isArray(spaceArr) && spaceArr.length > 0) return spaceArr[0].id;
  const created = await spaces.createSpace({
    name: spaceName,
    type: spaceType,
  });
  return created.data.id;
}

async function findAppInSpaceByName(appName, spaceId, limit = 1) {
  // Find an app in the given space by name
  const response = await items.getItems({
    name: appName,
    spaceId: spaceId,
    resourceType: "app",
    limit: limit,
  });
  const itemsArr = response?.data?.data;
  if (Array.isArray(itemsArr) && itemsArr.length > 0) return itemsArr;
  return null;
}

async function importAndPublishApp(qvfPath, sharedSpaceId, managedSpaceId) {
  const fileContent = fs.readFileSync(qvfPath);
  const appName = path.basename(qvfPath, ".qvf");
  // Import app to shared space
  const imported = await apps.importApp(
    {
      spaceId: sharedSpaceId,
      name: appName,
    },
    fileContent,
    {
      contentType: "application/octet-stream",
    }
  );
  const appId = imported.data.attributes.id;

  // Delete any other apps with the same name in the shared space (except the newly imported one)
  const sharedApps = await findAppInSpaceByName(appName, sharedSpaceId, 100);
  for (const app of Array.isArray(sharedApps) ? sharedApps : []) {
    if (app.resourceId !== appId) {
      await apps.deleteApp(app.resourceId);
      console.log(
        `Deleted duplicate app '${appName}' in shared space: ${app.id}`
      );
    }
  }

  // Check for existing app in managed space
  const existingApp = await findAppInSpaceByName(appName, managedSpaceId, 2);
  if (Array.isArray(existingApp) && existingApp.length > 1) {
    console.error(`Expected to find one app named '${appName}' in managed space '${managedSpaceId}', but found multiple. Aborting.`);
    process.exit(1);
  }
  const existingAppId = existingApp && existingApp[0] ? existingApp[0].resourceId : null;
  if (existingAppId) {
    
    // Publish and replace
    await apps.republishApp(appId, {
      data: 'source',
      targetId: existingAppId,
      checkOriginAppId: false,
    });
    console.log(`Imported and replaced app: ${appName}`);
  } else {
    // Publish new
    await apps.publishApp(appId, {
      spaceId: managedSpaceId,
    });
    console.log(`Imported and published new app: ${appName}`);
  }
  // Delete the app from the shared space after publishing
  await apps.deleteApp(appId);
}

(async () => {
  try {
    const sharedSpaceId = await getOrCreateSpace("Staging", "shared");
    const managedSpaceId = await getOrCreateSpace("Deployed", "managed");
    const qvfFiles = glob.sync("src/*.qvf");
    if (qvfFiles.length === 0) {
      console.log("No .qvf files found in src/.");
      return;
    }
    for (const qvf of qvfFiles) {
      await importAndPublishApp(qvf, sharedSpaceId, managedSpaceId);
    }
    console.log("All apps processed.");
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
})();
