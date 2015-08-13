// Used plain javascript because I couldn't get TS imports and type definitions to work. -JDK 2015-08-12
require.config({
    paths: {
        "react": "/bower_components/react/react",
        "react/addons": "/bower_components/react/react-with-addons",
        "moment": "/bower_components/moment/moment",
        "socket.io": "/socket.io/socket.io"
    }
});
require(["require", "exports", './Views'], function (require, exports, Views) {
    var bootstrap = new Views.Bootstrap();
    bootstrap.start();
});
//# sourceMappingURL=App.js.map