const {app, BrowserWindow, Menu} = require("electron");
const path = require("path");
const url = require("url");
const process = require("process");
const fs = require("fs");
const log = require("log");
const {spawn} = require("child_process");

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win,
    serviceProcess,
    logger = new log("info"),
    logsDir = path.join(__dirname, "logs"),
    appDir = app.getAppPath(),
    ballerinaHome = path.join(__dirname, "bre");

function createLogger(){
	if (!fs.existsSync(logsDir)){
		fs.mkdirSync(logsDir);
	}
	fs.access(logsDir, fs.W_OK, function(err) {
		if(err){
			logger.error("can't write to log folder.");
		}
		else{
			logger = new log("info", fs.createWriteStream(path.join(logsDir, "app.log")));
		}
	});
}

function createService(){
	let logsDirSysProp = "-DlogsDirectory=" + logsDir;
	let log4jConfPath = path.join(appDir, "conf", "log4j.properties");
	let log4jConfProp = "-Dlog4j.configuration=" + "file:" + log4jConfPath;
  let balComposerHomeProp = "-Dbal.composer.home=" + appDir;
	let debugArgs="-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=6006";

	serviceProcess = spawn("java", [log4jConfProp, logsDirSysProp, balComposerHomeProp,
                      "-jar", path.join(appDir, "workspace-service.jar")]);

	serviceProcess.stdout.on("data", function(data){
		logger.info("Service info: " + data);
	});

	serviceProcess.stderr.on("data", function(data){
		logger.error("Service error: " + data);
	});

	serviceProcess.on("close", function(code){
		logger.debug("Service closed: " + code);
	});
}


function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({width: 1024, height: 768, frame: true});

  // maximize the window
  win.maximize();

  //disable native menu
  Menu.setApplicationMenu(Menu.buildFromTemplate([]));

  // and load the index.html of the app.
  win.loadURL(url.format({
    pathname: path.join(__dirname, "resources", "composer", "web", "index.html"),
    protocol: "file:",
    slashes: true
  }));

  // Open the DevTools.
  //win.webContents.openDevTools()

  // Emitted when the window is closed.
  win.on("closed", () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", () => {
    createLogger();
    createService();
    createWindow();
});

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
  serviceProcess.kill();
});

app.on("activate", () => {
  // On macOS it"s common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow();
  }
});
