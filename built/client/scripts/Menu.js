/// <reference path="./typings/tsd.d.ts" />
/// <reference path="./Models.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'react/addons', './BaseViews', './Utils', './SmartInput'], function (require, exports, React, bv, Utils, SmartInput) {
    var MenuEdit = (function (_super) {
        __extends(MenuEdit, _super);
        function MenuEdit(props) {
            _super.call(this, props);
            this.name = '  MenuEdit';
            this.state = { selectedCategory: null, selectedItem: null };
        }
        MenuEdit.prototype.componentWillReceiveProps = function (nextProps) {
            if (nextProps.menu.categories !== this.props.menu.categories) {
                if (this.state.selectedCategory) {
                    var replacementCategory = nextProps.menu.categories[this.state.selectedCategory.key];
                    var nextState = { selectedCategory: replacementCategory, selectedItem: null };
                    if (this.state.selectedItem) {
                        nextState.selectedItem = replacementCategory.items[this.state.selectedItem.key];
                    }
                    this.setState(nextState);
                }
            }
        };
        MenuEdit.prototype.newCategory = function () {
            var _this = this;
            var mutable = {
                defaultType: 'Food',
                name: '',
                note: '',
                items: {}
            };
            this.setState({ selectedCategory: mutable, selectedItem: null }, function () {
                _this.refs['menuCategoryEditModal'].show();
            });
        };
        MenuEdit.prototype.newItem = function () {
            var _this = this;
            var mutable = {
                name: '',
                type: this.state.selectedCategory.defaultType,
                tax: this.state.selectedCategory.defaultTax,
                price: 0
            };
            this.setState({ selectedItem: mutable }, function () {
                _this.refs['menuItemEditModal'].show();
            });
        };
        MenuEdit.prototype.render = function () {
            var _this = this;
            var classNames = this.preRender(['menu-edit']);
            return (React.createElement("div", {"className": classNames.join(' ')}, React.createElement("button", {"onClick": this.newCategory.bind(this)}, "New Category"), React.createElement("button", {"onClick": this.newItem.bind(this)}, "New Item"), React.createElement(Menu, {"menu": this.props.menu, "selectedCategory": this.state.selectedCategory, "onCategorySelected": function (category) {
                if (_this.state.selectedCategory === category) {
                    _this.refs['menuCategoryEditModal'].show();
                }
                else {
                    _this.setState({ selectedCategory: category, selectedItem: null });
                }
            }, "selectedItem": this.state.selectedItem, "onItemSelected": function (item) { _this.setState({ selectedItem: item }); _this.refs['menuItemEditModal'].show(); }}), React.createElement(bv.ModalView, {"ref": "menuCategoryEditModal"}, this.state.selectedCategory ?
                React.createElement(MenuCategoryEdit, {"menu": this.props.menu, "category": this.state.selectedCategory, "onSave": function (mutable) {
                    mutable.key = mutable.key || new Date().toISOString();
                    var result = _this.props.menu.categories.set(mutable.key, mutable);
                    _this.setState({ selectedCategory: result.value, selectedItem: null }, function () {
                        _this.refs['menuCategoryEditModal'].hide();
                    });
                }, "onCancel": function () {
                    _this.refs['menuCategoryEditModal'].hide();
                }, "onRemove": function (key) {
                    _this.props.menu.categories.remove(key);
                    _this.setState({ selectedCategory: null, selectedItem: null }, function () {
                        _this.refs['menuCategoryEditModal'].hide();
                    });
                }})
                : null), React.createElement(bv.ModalView, {"ref": "menuItemEditModal"}, this.state.selectedItem ?
                React.createElement(MenuItemEdit, {"category": this.state.selectedCategory, "item": this.state.selectedItem, "onSave": function (mutable) {
                    mutable.key = mutable.key || new Date().toISOString();
                    var result = _this.state.selectedCategory.items.set(mutable.key, mutable);
                    _this.setState({ selectedItem: result.value }, function () {
                        _this.refs['menuItemEditModal'].hide();
                    });
                }, "onCancel": function () {
                    _this.setState({ selectedItem: null }, function () {
                        _this.refs['menuItemEditModal'].hide();
                    });
                }, "onRemove": function (key) {
                    _this.state.selectedCategory.items.remove(key);
                    _this.setState({ selectedItem: null }, function () {
                        _this.refs['menuItemEditModal'].hide();
                    });
                }})
                : null)));
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
            var newState = {};
            if (nextProps.selectedCategory)
                newState.selectedCategory = nextProps.selectedCategory;
            if (nextProps.selectedItem)
                newState.selectedItem = nextProps.selectedItem;
            if (newState != {}) {
                this.setState(newState);
            }
        };
        Menu.prototype.render = function () {
            var _this = this;
            var classNames = this.preRender(['menu']);
            var menuItems = {};
            if (this.state.selectedCategory)
                menuItems = this.state.selectedCategory.items;
            return (React.createElement("div", {"className": classNames.join(' ')}, React.createElement(MenuCategories, {"categories": this.props.menu.categories, "selectedCategory": this.state.selectedCategory, "onSelectCategory": function (category) { _this.setState({ selectedCategory: category }); if (_this.props.onCategorySelected)
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
            console.log('mutable', this.state.mutable);
            this.props.onSave(this.state.mutable);
        };
        MenuCategoryEdit.prototype.remove = function () {
            if (confirm('Delete this category and all items?')) {
                this.props.onRemove(this.props.category.key);
            }
        };
        MenuCategoryEdit.prototype.render = function () {
            var _this = this;
            var classNames = this.preRender(['menu-category-details']);
            var mutable = this.state.mutable;
            return (React.createElement("div", {"className": classNames.join(' ')}, React.createElement("h3", null, "Edit Category"), React.createElement("div", {"className": "inner"}, React.createElement("span", {"className": "col-4"}, "Type: "), React.createElement("select", {"className": "col-4", "value": mutable.defaultType, "onChange": this.handleChange.bind(this, 'mutable', 'defaultType')}, React.createElement("option", null), React.createElement("option", null, "Food"), React.createElement("option", null, "Alcohol")), React.createElement("br", null), React.createElement("p", null, React.createElement("span", {"className": "col-4"}, "Name: "), React.createElement(SmartInput.SmartInput, {"className": "col-6", "model": mutable, "modelProp": "name", "isPOCO": true})), React.createElement("p", null, React.createElement("span", {"className": "col-4"}, "Default Tax: "), React.createElement(SmartInput.SmartInput, {"className": "col-2", "model": mutable, "modelProp": "defaultTax", "isNumber": true, "isPOCO": true})), React.createElement("p", null, React.createElement("span", {"className": "col-4"}, "Note: "), React.createElement(SmartInput.SmartInput, {"className": "col-10", "model": mutable, "modelProp": "note", "isPOCO": true})), React.createElement(bv.SimpleConfirmView, {"onCancel": function () { _this.cancel(); }, "onSave": function () { _this.save(); }, "onRemove": this.state.isNew ? null : this.remove.bind(this), "isDirty": this.state.isDirty}))));
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
        MenuItemEdit.prototype.render = function () {
            var _this = this;
            var classNames = this.preRender(['menu-category-details']);
            var mutable = this.state.mutable;
            return (React.createElement("div", {"className": classNames.join(' ')}, React.createElement("h3", null, "Edit Item"), React.createElement("div", {"className": "inner"}, React.createElement("p", null, React.createElement("span", {"className": "col-4"}, "Name: "), React.createElement(SmartInput.SmartInput, {"className": "col-6", "model": mutable, "modelProp": "name", "isPOCO": true})), React.createElement("p", null, React.createElement("span", {"className": "col-4"}, "Price: "), React.createElement(SmartInput.SmartInput, {"className": "col-2", "model": mutable, "modelProp": "price", "isNumber": true, "isPOCO": true})), React.createElement("p", null, React.createElement("span", {"className": "col-4"}, "Tax: "), React.createElement(SmartInput.SmartInput, {"className": "col-2", "model": mutable, "modelProp": "tax", "isNumber": true, "isPOCO": true})), React.createElement(bv.SimpleConfirmView, {"onCancel": function () { _this.cancel(); }, "onSave": function () { _this.save(); }, "onRemove": this.state.isNew ? null : this.remove.bind(this), "isDirty": this.state.isDirty}))));
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
            var classNames = this.preRender(['menu-categories']);
            var categories = Utils.toArray(this.props.categories);
            var nodes = categories.map(function (category) {
                var isSelected = category === _this.props.selectedCategory;
                return (React.createElement(MenuCategory, {"key": category.key, "category": category, "isSelected": isSelected, "onSelectCategory": _this.props.onSelectCategory.bind(_this)}));
            });
            return (React.createElement("div", {"className": classNames.join(' ')}, React.createElement("ul", null, nodes)));
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
            var classNames = this.preRender();
            if (this.props.isSelected)
                classNames.push('active');
            return (React.createElement("li", {"className": classNames.join(' '), "onClick": function () { _this.props.onSelectCategory(_this.props.category); }}, this.props.category.name));
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
            var classNames = this.preRender(['menu-items']);
            var items = Utils.toArray(this.props.items);
            var nodes = items.map(function (item) {
                var isSelected = item === _this.props.selectedItem;
                return (React.createElement(MenuItem, {"key": item.key, "item": item, "isSelected": isSelected, "onSelect": _this.props.onSelectItem.bind(_this)}));
            });
            return (React.createElement("div", {"className": classNames.join(' ')}, React.createElement("ul", null, nodes)));
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
            var classNames = this.preRender();
            if (this.props.isSelected)
                classNames.push('active');
            return (React.createElement("li", {"className": classNames.join(' '), "onClick": function () { _this.props.onSelect(_this.props.item); }}, React.createElement("span", {"className": "name"}, this.props.item.name), React.createElement("span", {"className": "price"}, Utils.formatCurrency(this.props.item.price))));
        };
        return MenuItem;
    })(bv.SyncView);
    exports.MenuItem = MenuItem;
});
//# sourceMappingURL=Menu.js.map