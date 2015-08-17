/// <reference path="./typings/tsd.d.ts" />
/// <reference path="./Models.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'react/addons', './BaseViews'], function (require, exports, React, bv) {
    var MenuEdit = (function (_super) {
        __extends(MenuEdit, _super);
        function MenuEdit(props) {
            _super.call(this, props);
            this.name = '  MenuEdit';
            this.state = { selectedCategory: null, selectedItem: null };
        }
        MenuEdit.prototype.componentWillReceiveProps = function (nextProps, nextState) {
            console.log(this.name, 'New Menu Props11111111111111', nextProps, nextState);
            if (nextProps.menu && this.state.selectedCategory)
                this.setState({ selectedCategory: nextProps.menu.categories[this.state.selectedCategory.key] });
        };
        MenuEdit.prototype.newCategory = function () {
            var mutable = {
                type: 'Food',
                name: '',
                note: '',
                items: {}
            };
            this.setState({ selectedCategory: mutable, selectedItem: null });
        };
        MenuEdit.prototype.newItem = function () {
            var mutable = {
                name: '',
                price: 0
            };
            this.setState({ selectedItem: mutable });
        };
        MenuEdit.prototype.render = function () {
            var _this = this;
            console.log(this.name + ': Render');
            return (React.createElement("div", {"className": "menu-edit"}, "ID: ", this.state.selectedCategory ? this.state.selectedCategory.__syncNodeId : 'none selected', React.createElement("button", {"onClick": this.newCategory.bind(this)}, "New Category"), React.createElement("button", {"onClick": this.newItem.bind(this)}, "New Item"), React.createElement(Menu, {"menu": this.props.menu, "selectedCategory": this.state.selectedCategory, "onCategorySelected": function (category) { _this.setState({ selectedCategory: category, selectedItem: null }); }, "selectedItem": this.state.selectedItem, "onItemSelected": function (item) { _this.setState({ selectedItem: item }); }}), this.state.selectedCategory ?
                React.createElement(MenuCategoryEdit, {"menu": this.props.menu, "category": this.state.selectedCategory, "onSave": function (mutable) {
                    mutable.key = mutable.key || new Date().toISOString();
                    var result = _this.props.menu.categories.set(mutable.key, mutable);
                    _this.setState({ selectedCategory: result.value, selectedItem: null });
                }, "onCancel": function () { _this.setState({ selectedCategory: null, selectedItem: null }); }, "onRemove": function (key) {
                    _this.props.menu.categories.remove(key);
                    _this.setState({ selectedCategory: null, selectedItem: null });
                }})
                : null, this.state.selectedItem ?
                React.createElement(MenuItemEdit, {"category": this.state.selectedCategory, "item": this.state.selectedItem, "onSave": function (mutable) {
                    mutable.key = mutable.key || new Date().toISOString();
                    console.log('   Saving menu item: ', mutable);
                    console.log('   Saving  to menu items: ', _this.state.selectedCategory.items);
                    var result = _this.state.selectedCategory.items.set(mutable.key, mutable);
                    _this.setState({ selectedItem: result.value });
                }, "onCancel": function () { _this.setState({ selectedItem: null }); }, "onRemove": function (key) {
                    _this.state.selectedCategory.items.remove(key);
                    _this.setState({ selectedItem: null });
                }})
                : null));
        };
        return MenuEdit;
    })(bv.SyncView);
    exports.MenuEdit = MenuEdit;
    var Menu = (function (_super) {
        __extends(Menu, _super);
        function Menu(props) {
            _super.call(this, props);
            this.name = '  MenuView';
            this.state = { selectedCategory: null };
        }
        Menu.prototype.componentWillReceiveProps = function (nextProps) {
            console.log('Menu to receive new props:', nextProps);
            var newState = {};
            if (nextProps.selectedCategory)
                newState.selectedCategory = nextProps.selectedCategory;
            if (nextProps.selectedItem)
                newState.selectedItem = nextProps.selectedItem;
            console.log('Menu to receive new       state:', newState);
            if (newState != {}) {
                this.setState(newState);
            }
        };
        Menu.prototype.render = function () {
            var _this = this;
            console.log(this.name + ': Render');
            var menuItems = {};
            if (this.state.selectedCategory)
                menuItems = this.state.selectedCategory.items;
            return (React.createElement("div", {"className": "menu"}, React.createElement(MenuCategories, {"categories": this.props.menu.categories, "selectedCategory": this.state.selectedCategory, "onSelectCategory": function (category) { _this.setState({ selectedCategory: category }); if (_this.props.onCategorySelected)
                _this.props.onCategorySelected(category); }}), React.createElement(MenuItems, {"items": menuItems, "selectedItem": this.state.selectedItem, "onSelectItem": function (item) { if (_this.props.onItemSelected)
                _this.props.onItemSelected(item); }})));
        };
        return Menu;
    })(bv.SyncView);
    exports.Menu = Menu;
    var MenuCategoryEdit = (function (_super) {
        __extends(MenuCategoryEdit, _super);
        function MenuCategoryEdit(props) {
            _super.call(this, props);
            this.name = '      MenuCategoryEditView';
            this.state = this.getState(props);
        }
        MenuCategoryEdit.prototype.shouldComponentUpdate = function (nextProps, nextState) {
            return _super.prototype.shouldComponentUpdate.call(this, nextProps, nextState) || this.state.isDirty;
        };
        MenuCategoryEdit.prototype.componentWillReceiveProps = function (nextProps) {
            if (this.props.category !== nextProps.category) {
                this.setState(this.getState(nextProps));
            }
        };
        MenuCategoryEdit.prototype.getState = function (props) {
            var isNew = props.category.key ? false : true;
            var mutable = JSON.parse(JSON.stringify(props.category));
            return {
                mutable: mutable,
                isNew: isNew,
                isDirty: false
            };
        };
        MenuCategoryEdit.prototype.cancel = function () {
            this.props.onCancel();
        };
        MenuCategoryEdit.prototype.save = function () {
            this.state.mutable.lastModified = new Date().toISOString();
            this.props.onSave(this.state.mutable);
        };
        MenuCategoryEdit.prototype.remove = function () {
            this.props.onRemove(this.props.category.key);
        };
        MenuCategoryEdit.prototype.handleChange = function (fieldName, event) {
            var mutable = this.state.mutable;
            if (mutable[fieldName] !== event.target.value) {
                mutable[fieldName] = event.target.value;
                this.setState({
                    mutable: mutable,
                    isDirty: true
                });
            }
        };
        MenuCategoryEdit.prototype.render = function () {
            var _this = this;
            console.log(this.name + ': Render Details: ' + this.props.category.name);
            var mutable = this.state.mutable;
            return (React.createElement("div", {"className": "menu-category-details"}, React.createElement("h3", null, "Edit Category"), React.createElement("div", {"className": "inner"}, React.createElement("span", {"className": "col-4"}, "Type: "), React.createElement("select", {"className": "col-4", "ref": "type", "value": mutable.type, "onChange": this.handleChange.bind(this, "type")}, React.createElement("option", null), React.createElement("option", null, "Food"), React.createElement("option", null, "Alcohol")), React.createElement("br", null), React.createElement("p", null, React.createElement("span", {"className": "col-4"}, "Name: "), React.createElement("input", {"className": "col-6", "ref": "name", "value": mutable.name, "onChange": this.handleChange.bind(this, "name")})), React.createElement("p", null, React.createElement("span", {"className": "col-4"}, "Note: "), React.createElement("input", {"className": "col-10", "value": mutable.note, "onChange": this.handleChange.bind(this, "note")})), React.createElement(bv.SimpleConfirmView, {"onCancel": function () { _this.cancel(); }, "onSave": function () { _this.save(); }, "onRemove": this.state.isNew ? null : this.remove.bind(this), "isDirty": this.state.isDirty}))));
        };
        return MenuCategoryEdit;
    })(bv.SyncView);
    exports.MenuCategoryEdit = MenuCategoryEdit;
    var MenuItemEdit = (function (_super) {
        __extends(MenuItemEdit, _super);
        function MenuItemEdit(props) {
            _super.call(this, props);
            this.name = '      MenuItemEditView';
            this.state = this.getState(props);
        }
        MenuItemEdit.prototype.shouldComponentUpdate = function (nextProps, nextState) {
            return _super.prototype.shouldComponentUpdate.call(this, nextProps, nextState) || this.state.isDirty;
        };
        MenuItemEdit.prototype.componentWillReceiveProps = function (nextProps) {
            if (this.props.item !== nextProps.item) {
                this.setState(this.getState(nextProps));
            }
        };
        MenuItemEdit.prototype.getState = function (props) {
            var isNew = props.item.key ? false : true;
            var mutable = JSON.parse(JSON.stringify(props.item));
            return {
                mutable: mutable,
                isNew: isNew,
                isDirty: false
            };
        };
        MenuItemEdit.prototype.cancel = function () {
            this.props.onCancel();
        };
        MenuItemEdit.prototype.save = function () {
            this.props.onSave(this.state.mutable);
        };
        MenuItemEdit.prototype.remove = function () {
            this.props.onRemove(this.props.item.key);
        };
        MenuItemEdit.prototype.handleChange = function (fieldName, event) {
            var mutable = this.state.mutable;
            if (mutable[fieldName] !== event.target['value']) {
                mutable[fieldName] = event.target['value'];
                this.setState({
                    mutable: mutable,
                    isDirty: true
                });
            }
        };
        MenuItemEdit.prototype.render = function () {
            var _this = this;
            var mutable = this.state.mutable;
            return (React.createElement("div", {"className": "menu-category-details"}, React.createElement("h3", null, "Edit Item"), React.createElement("div", {"className": "inner"}, React.createElement("p", null, React.createElement("span", {"className": "col-4"}, "Name: "), React.createElement("input", {"className": "col-6", "ref": "name", "value": mutable.name, "onChange": this.handleChange.bind(this, "name")})), React.createElement("p", null, React.createElement("span", {"className": "col-4"}, "Price: "), React.createElement("input", {"className": "col-2", "value": mutable.price.toString(), "onChange": this.handleChange.bind(this, "price")})), React.createElement(bv.SimpleConfirmView, {"onCancel": function () { _this.cancel(); }, "onSave": function () { _this.save(); }, "onRemove": this.state.isNew ? null : this.remove.bind(this), "isDirty": this.state.isDirty}))));
        };
        return MenuItemEdit;
    })(bv.SyncView);
    exports.MenuItemEdit = MenuItemEdit;
    var MenuCategories = (function (_super) {
        __extends(MenuCategories, _super);
        function MenuCategories() {
            _super.apply(this, arguments);
            this.name = '    MenuCategories';
        }
        MenuCategories.prototype.render = function () {
            var _this = this;
            console.log(this.name + ': Render');
            var nodes = Object.keys(this.props.categories).map(function (key) {
                if (key === 'lastModified')
                    return;
                var category = _this.props.categories[key];
                var isSelected = category === _this.props.selectedCategory;
                return (React.createElement(MenuCategory, {"key": key, "category": category, "isSelected": isSelected, "onSelectCategory": _this.props.onSelectCategory.bind(_this)}));
            });
            return (React.createElement("div", {"className": "menu-categories"}, React.createElement("ul", null, nodes)));
        };
        return MenuCategories;
    })(bv.SyncView);
    exports.MenuCategories = MenuCategories;
    var MenuCategory = (function (_super) {
        __extends(MenuCategory, _super);
        function MenuCategory() {
            _super.apply(this, arguments);
            this.name = '      MenuCategory';
        }
        MenuCategory.prototype.render = function () {
            var _this = this;
            var classNames = _super.prototype.preRender.call(this);
            if (this.props.isSelected)
                classNames.push('active');
            return (React.createElement("li", {"className": classNames.join(' '), "onClick": function () { _this.props.onSelectCategory(_this.props.category); }}, this.props.category.__syncNodeId + this.props.category.name));
        };
        return MenuCategory;
    })(bv.SyncView);
    exports.MenuCategory = MenuCategory;
    var MenuItems = (function (_super) {
        __extends(MenuItems, _super);
        function MenuItems() {
            _super.apply(this, arguments);
            this.name = '    MenuItems';
        }
        MenuItems.prototype.render = function () {
            var _this = this;
            console.log(this.name + ': Render');
            var nodes = Object.keys(this.props.items).map(function (key) {
                if (key === 'lastModified')
                    return;
                var item = _this.props.items[key];
                var isSelected = item === _this.props.selectedItem;
                return (React.createElement(MenuItem, {"key": item.key, "item": item, "isSelected": isSelected, "onSelect": _this.props.onSelectItem.bind(_this)}));
            });
            return (React.createElement("div", {"className": "menu-items"}, React.createElement("ul", null, nodes)));
        };
        return MenuItems;
    })(bv.SyncView);
    exports.MenuItems = MenuItems;
    var MenuItem = (function (_super) {
        __extends(MenuItem, _super);
        function MenuItem(props) {
            _super.call(this, props);
            this.name = '          MenuItem';
            this.state = { isNew: true };
        }
        MenuItem.prototype.render = function () {
            var _this = this;
            var classNames = _super.prototype.preRender.call(this);
            if (this.props.isSelected)
                classNames.push('active');
            return (React.createElement("li", {"className": classNames.join(' '), "onClick": function () { _this.props.onSelect(_this.props.item); }}, React.createElement("span", {"className": "name"}, this.props.item.__syncNodeId + ' ' + this.props.item.name), React.createElement("span", {"className": "price"}, this.props.item.price)));
        };
        return MenuItem;
    })(bv.SyncView);
    exports.MenuItem = MenuItem;
});
//# sourceMappingURL=Menu.js.map