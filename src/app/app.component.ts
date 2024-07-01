import { ChangeDetectorRef, Component } from '@angular/core';
import { ElectronService } from './services/electron.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'gestor-de-aplicaciones';

  mensaje = "";

  constructor(
    private electronService: ElectronService,
    private cdRef: ChangeDetectorRef
  ) {}

  ping(){
    this.electronService.send("ping", "ping");
    this.electronService.on("pong", (event: any, arg: string) => {
      this.mensaje = "pong";
      this.cdRef.detectChanges();
    });
  }

  ngOnDestroy(): void {
    this.electronService.removeAllListeners("pong");
  }
}
