import { Injectable, NgZone } from '@angular/core';
import { IpcRenderer} from "electron";

@Injectable({
  providedIn: 'root'
})
export class ElectronService {

  private ipc!: IpcRenderer;

  constructor(private ngZone: NgZone) {
    if (window.require) {
      try {
        this.ipc = window.require("electron").ipcRenderer;
      } catch (e) {
        throw e;
      }
    } else {
      console.warn("Electron IPC was not loaded");
    }
  }

  public on(channel: string, listener: (...args: any[]) => void): void {
    if (!this.ipc) {
      return;
    }
    this.ipc.on(channel, (event, ...args) => {
      this.ngZone.run(() => {
        listener(event, ...args);
      });
    });
  }
  
  public once(channel: string, listener: any): void {
    if (!this.ipc) {
      return;
    }
    this.ipc.once(channel, listener);
  }

  public send(channel: string, ...args: any[]): void {
    if (!this.ipc) {
      return;
    }
    this.ipc.send(channel, ...args);
  }

  public removeAllListeners(channel: string): void {
    if (!this.ipc) {
      return;
    }
    this.ipc.removeAllListeners(channel);
  }

  public invoke(channel: string, ...args: any[]): Promise<any> {
    return new Promise((resolve, reject) => {
      this.ipc.invoke(channel, args).then((result) => {
        this.ngZone.run(() => {
          resolve(result);
        });
      })
    });
  }
   
}
