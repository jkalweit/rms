// Used plain javascript because I couldn't get TS imports and type definitions to work. -JDK 2015-08-12

declare var require: any;

require.config({
    paths: {
        "react": "/bower_components/react/react",
        "react/addons": "/bower_components/react/react-with-addons",
        "moment": "/bower_components/moment/moment",
        "socket.io": "/socket.io/socket.io"
    }
});

require(["require", "exports", './Views'], function (require: any, exports: any, Views: any) {
    var bootstrap = new Views.Bootstrap();
    bootstrap.start();
});
