const { app, BrowserWindow, dialog, ipcMain} = require('electron');

function createWindow() {
  const win = new BrowserWindow({
    width: 1600,
    height: 900,
    webPreferences: {
      nodeIntegration: true
    }
  });
  win.loadFile('index.html');
  ipcMain.on('select-file', async function(event) {
    let options = {
      // See place holder 1 in above image
      title : "Custom title bar", 
      
      // See place holder 2 in above image
      defaultPath : "D:\\electron-app",
      
      // See place holder 3 in above image
      buttonLabel : "Custom button",
      
      // See place holder 4 in above image
      filters :[
       {name: 'Images', extensions: ['jpg', 'png', 'gif']},
       {name: 'Movies', extensions: ['mkv', 'avi', 'mp4']},
       {name: 'Custom File Type', extensions: ['as']},
       {name: 'All Files', extensions: ['*']}
      ],
      properties: ['openFile','multiSelections']
     }
     
     //Synchronous
     let dialogResult = await dialog.showOpenDialog(win, options);
     console.log(dialogResult.filePaths);
     event.sender.send('selected-file', dialogResult.filePaths[0])
  });
}



app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
})

//https://ourcodeworld.com/articles/read/134/how-to-use-the-camera-with-electron-framework-create-a-snapshot-and-save-the-image-on-the-system
//https://itnext.io/face-api-js-javascript-api-for-face-recognition-in-the-browser-with-tensorflow-js-bcc2a6c4cf07
//https://github.com/justadudewhohacks/face-api.js#models-face-recognition
