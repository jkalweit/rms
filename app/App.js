require.config({
  paths: {
    "react/addons": "/bower_components/react/react-with-addons",
    "freezer-js": "/bower_components/freezer-js/build/freezer",
    "immutable": "/bower_components/immutable/dist/immutable",
    "moment": "/bower_components/moment/moment",
    "socket.io": "/socket.io/socket.io"
  }
});

require(['require', 'exports', 'react/addons', 'views'], function (require, exports, React, views) {
  React.render(React.createElement(views.MainView, null), document.getElementById('content'));
});
