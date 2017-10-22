import { NgModule, ErrorHandler, APP_INITIALIZER, Injector } from '@angular/core';
import { Http, HttpModule } from '@angular/http';
import { CommonModule } from '@angular/common';
import { LOCATION_INITIALIZED } from '@angular/common';
import { ServiceWorkerModule } from '@angular/service-worker';

import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Push } from '@ionic-native/push';
import { Toast } from '@ionic-native/toast';
import { Storage } from '@ionic/storage';

import { MomentModule } from 'angular2-moment';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { WpApiModule, WpApiLoader, WpApiStaticLoader } from 'wp-api-angular'


// import { SharedWPHCModule } from '../src/app/app.module';
// import { WPHC } from '../src/app/app.component';

import { PAGES } from './pages/';
import { COMPONENTS } from './components/';
import { PIPES } from './pipes/';
import { PROVIDERS, Config, Storage as OwnStorage, } from './providers/';

// AoT requires an exported function for factories
export function createTranslateLoader(http: Http) {
    return new TranslateHttpLoader(http, './build/i18n/', '.json');
}

export function WpApiLoaderFactory(http: any, config: Config) {
    console.log("config.getApi('baseUrl', '')", config.getRaw())
    return new WpApiStaticLoader(http, config.getApi('baseUrl', ''), config.getApi('namespace', ''));
}

export function provideStorage() {
    return new Storage({ name: '__wphc' });
}

export function appInitializerStorageFactory(storage: OwnStorage) {
    return function () {
        return storage.init();
    };
};

export function appInitializerTranslateFactory(translate: TranslateService, injector: Injector, config: Config) {
    return () => new Promise<any>((resolve: any) => {
        const locationInitialized = injector.get(LOCATION_INITIALIZED, Promise.resolve(null));
        locationInitialized.then(() => {
            const defaultLanguage = config.get('defaultLanguage');
            const browserLanguage = translate.getBrowserLang()
            translate.setDefaultLang(defaultLanguage);
            translate.use(browserLanguage || defaultLanguage).subscribe(() => {
                console.info(`Successfully initialized '${browserLanguage || defaultLanguage}' language.'`);
            }, err => {
                console.error(`Problem with '${browserLanguage || defaultLanguage}' language initialization.'`);
            }, () => {
                resolve(null);
            });
        });
    });
};

@NgModule({
    imports: [
        // CommonModule
        // SharedWPHCModule,
        HttpModule,
        IonicModule,
        MomentModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: (createTranslateLoader),
                deps: [Http]
            }
        }),
        WpApiModule.forRoot({
            provide: WpApiLoader,
            useFactory: (WpApiLoaderFactory),
            deps: [Http, Config]
        }),
        ServiceWorkerModule,
    ],
    declarations: [...COMPONENTS, ...PAGES, ...PIPES],
    entryComponents: [...COMPONENTS, ...PAGES],
    exports: [...COMPONENTS, ...PAGES, ...PIPES],
    providers: [
        // Storage,
        ...PROVIDERS,
        StatusBar,
        SplashScreen,
        Push,
        Toast,
        { provide: Storage, useFactory: provideStorage },
        // { provide: Settings, useFactory: provideSettings, deps: [ Storage ] },
        // Keep this to enable Ionic's runtime error handling during development
        { provide: ErrorHandler, useClass: IonicErrorHandler },
        {
            provide: APP_INITIALIZER,
            useFactory: appInitializerStorageFactory,
            deps: [OwnStorage],
            multi: true
        }, {
            provide: APP_INITIALIZER,
            useFactory: appInitializerTranslateFactory,
            deps: [TranslateService, Injector, Config],
            multi: true
        }
    ]
})
export class CustomWPHCModule { }