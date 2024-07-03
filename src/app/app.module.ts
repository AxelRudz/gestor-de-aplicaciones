import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ReactiveFormsModule } from '@angular/forms';
import { TablaAplicacionesComponent } from './tabla-aplicaciones/tabla-aplicaciones.component';
import { ModalAgregarAppComponent } from './modal-agregar-app/modal-agregar-app.component';
import { TerminalesAppsComponent } from './terminales-apps/terminales-apps.component';

@NgModule({
  declarations: [
    AppComponent,
    TablaAplicacionesComponent,
    ModalAgregarAppComponent,
    TerminalesAppsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
