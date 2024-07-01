const { app, BrowserWindow, Menu, ipcMain } = require('electron/main')
const path = require('node:path')

function createWindow () {
  const win = new BrowserWindow({
    title: "Gestor de aplicaciones",
    width: 800,
    height: 600,
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: false,
      nodeIntegration: true,
    }
  })

  win.loadURL(`file://${__dirname}/dist/gestor-de-aplicaciones/index.html`);

  //win.webContents.openDevTools();

  const template = [
    {
      label: "Agregar aplicación...",
      submenu: [
        {
          label: "Angular",
          role: "Angular",
        },
        {
          label: "Spring-Boot",
          role:"Springboot"
        }
      ]
    },
    {
      label: "Salir",
      click: () => win.close()
    },
  ]

  const menu = Menu.buildFromTemplate(template)

  Menu.setApplicationMenu(menu);

}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

ipcMain.on("ping", (event) => event.reply("pong", "pong"));