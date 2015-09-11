/// <reference path="./typings/tsd.d.ts" />
/// <reference path="./Models.ts" />

import React = require('react/addons');
import Models = require('./Models');
import Sync = require('./SyncNode');
import bv = require('./BaseViews');
import Utils = require('./Utils');
import SmartInput = require('./SmartInput');


export interface MenuEditProps {
    menu: Models.Menu;
}
export interface MenuEditState extends bv.SyncViewState {
    selectedCategory?: Models.MenuCategory;
    selectedItem?: Models.MenuItem;
}
export class MenuEdit extends bv.SyncView<MenuEditProps, MenuEditState> {
    name: string = '  MenuEdit';
    constructor(props: MenuEditProps) {
        super(props);
        this.state = { selectedCategory: null, selectedItem: null };
    }
    componentWillReceiveProps(nextProps: MenuEditProps) {
        if(nextProps.menu.categories !== this.props.menu.categories) {
          if(this.state.selectedCategory) {
            var replacementCategory = nextProps.menu.categories[this.state.selectedCategory.key];
            var nextState: MenuEditState = { selectedCategory: replacementCategory, selectedItem: null };
            if(this.state.selectedItem) {
              nextState.selectedItem = replacementCategory.items[this.state.selectedItem.key];
            }
            this.setState(nextState);
          }
        }
    }
    newCategory() {
        var mutable = {
            type: 'Food',
            name: '',
            note: '',
            items: {}
        } as Models.MenuCategory;
        this.setState({ selectedCategory: mutable, selectedItem: null }, () => {
            (this.refs['menuCategoryEditModal'] as bv.ModalView).show();
        });
    }
    newItem() {
        var mutable = {
            name: '',
            price: 0
        } as Models.MenuItem;
        this.setState({ selectedItem: mutable }, () => {
            (this.refs['menuItemEditModal'] as bv.ModalView).show();
        });
    }
    render() {
        //console.log(this.name + ': Render');
        var classNames = this.preRender(['menu-edit']);
        return (
            <div className={classNames.join(' ')}>
              <button onClick={this.newCategory.bind(this) }>New Category</button>
              <button onClick={this.newItem.bind(this) }>New Item</button>
              <Menu menu={this.props.menu}
              selectedCategory={this.state.selectedCategory}
              onCategorySelected={(category) => {
                if(this.state.selectedCategory === category) {
                  (this.refs['menuCategoryEditModal'] as bv.ModalView).show();
                } else {
                  this.setState({ selectedCategory: category, selectedItem: null });
                }
              } }
              selectedItem={this.state.selectedItem}
              onItemSelected={(item) => { this.setState({ selectedItem: item }); (this.refs['menuItemEditModal'] as bv.ModalView).show(); } }></Menu>
              <bv.ModalView ref="menuCategoryEditModal">

              { this.state.selectedCategory ?
                  <MenuCategoryEdit
                  menu={this.props.menu}
                  category={this.state.selectedCategory}
                  onSave={(mutable: Models.MenuCategory) => {
                      mutable.key = mutable.key || new Date().toISOString();
                      var result = (this.props.menu.categories as Sync.ISyncNode).set(mutable.key, mutable);
                      this.setState({ selectedCategory: result.value, selectedItem: null }, () => {
                          (this.refs['menuCategoryEditModal'] as bv.ModalView).hide();
                      });
                  } }
                  onCancel={() => {
                      (this.refs['menuCategoryEditModal'] as bv.ModalView).hide();
                  } }
                  onRemove={(key: string) => {
                      (this.props.menu.categories as Sync.ISyncNode).remove(key);
                      this.setState({ selectedCategory: null, selectedItem: null }, () => {
                          (this.refs['menuCategoryEditModal'] as bv.ModalView).hide();
                      });
                  } }
                  ></MenuCategoryEdit>
                  : null }

              </bv.ModalView>

              <bv.ModalView ref="menuItemEditModal">

                { this.state.selectedItem ?
                    <MenuItemEdit
                    category={this.state.selectedCategory}
                    item={this.state.selectedItem}
                    onSave={(mutable: Models.MenuItem) => {
                        mutable.key = mutable.key || new Date().toISOString();
                        var result = (this.state.selectedCategory.items as Sync.ISyncNode).set(mutable.key, mutable);
                        this.setState({ selectedItem: result.value as Models.MenuItem }, () => {
                            (this.refs['menuItemEditModal'] as bv.ModalView).hide();
                        });
                    } }
                    onCancel={() => {
                        this.setState({ selectedItem: null }, () => {
                            (this.refs['menuItemEditModal'] as bv.ModalView).hide();
                        });
                    } }
                    onRemove={(key: string) => {
                        (this.state.selectedCategory.items as Sync.ISyncNode).remove(key);
                        this.setState({ selectedItem: null }, () => {
                            (this.refs['menuItemEditModal'] as bv.ModalView).hide();
                        });
                    } }
                    ></MenuItemEdit>
                    : null }

              </bv.ModalView>
            </div>
        );
    }
}






export interface MenuProps {
    menu: Models.Menu;
    onCategorySelected?: (category: Models.MenuCategory) => void;
    onItemSelected?: (item: Models.MenuItem) => void;
    selectedCategory?: Models.MenuCategory;
    selectedItem?: Models.MenuItem;
}
export interface MenuState {
    selectedCategory?: Models.MenuCategory;
    selectedItem?: Models.MenuItem;
}
export class Menu extends bv.SyncView<MenuProps, MenuState> {
    name: string = '  MenuView';
    constructor(props: MenuProps) {
        super(props);
        this.state = { selectedCategory: null }
    }
    componentWillReceiveProps(nextProps: MenuProps) {
        var newState = {} as any;
        if (nextProps.selectedCategory) newState.selectedCategory = nextProps.selectedCategory;
        if (nextProps.selectedItem) newState.selectedItem = nextProps.selectedItem;
        if (newState != {}) {
            this.setState(newState);
        }
    }
    render() {
        //console.log(this.name + ': Render');
        var classNames = this.preRender(['menu']);
        var menuItems = {} as { [key: string]: Models.MenuItem };
        if (this.state.selectedCategory) menuItems = this.state.selectedCategory.items;
        return (
            <div className={classNames.join(' ')}>
              <MenuCategories
              categories={this.props.menu.categories}
              selectedCategory={ this.state.selectedCategory }
              onSelectCategory={ (category: Models.MenuCategory) => { this.setState({ selectedCategory: category }); if (this.props.onCategorySelected) this.props.onCategorySelected(category); } }></MenuCategories>
              <MenuItems items={menuItems}
              selectedItem={this.state.selectedItem}
              onSelectItem={ (item: Models.MenuItem) => { if (this.props.onItemSelected) this.props.onItemSelected(item); } }></MenuItems>
            </div>
        );
    }
}










export interface MenuCategoryEditProps {
    category: Models.MenuCategory;
    menu: Models.Menu;
    onSave(mutable: Models.MenuCategory): void;
    onCancel(): void;
    onRemove(key: string): void;
}
export interface MenuCategoryEditState {
    mutable?: Models.MenuCategory;
    isNew?: boolean;
    isDirty?: boolean;
}
export class MenuCategoryEdit extends bv.SyncView<MenuCategoryEditProps, MenuCategoryEditState> {
    name: string = '      MenuCategoryEditView';
    shouldComponentUpdate(nextProps: MenuCategoryEditProps, nextState: MenuCategoryEditState) {
        return super.shouldComponentUpdate(nextProps, nextState) || this.state.isDirty;
    }
    constructor(props: MenuCategoryEditProps) {
        super(props);
        this.state = this.getState(props);
    }
    componentWillReceiveProps(nextProps: MenuCategoryEditProps) {
        if (this.props.category !== nextProps.category) {
            this.setState(this.getState(nextProps));
        }
    }
    getState(props: MenuCategoryEditProps): MenuCategoryEditState {
        var isNew = props.category.key ? false : true;
        var mutable = JSON.parse(JSON.stringify(props.category));
        return {
            mutable: mutable,
            isNew: isNew,
            isDirty: false
        };
    }
    cancel() {
        this.props.onCancel();
    }
    save() {
        this.state.mutable.lastModified = new Date().toISOString();
        console.log('mutable', this.state.mutable);
        this.props.onSave(this.state.mutable);
        //Store.menuCategoryUpdate(this.state.mutable, (newImmutable) => { this.props.onSaved(newImmutable); });
    }
    remove() {
      if(confirm('Delete this category and all items?')) {
        this.props.onRemove(this.props.category.key);
      }
        //Store.menuCategoryRemove(this.props.category.key, () => { this.props.onRemoved(); });
    }
    render() {
        //console.log(this.name + ': Render Details: ' + this.props.category.name);
        var classNames = this.preRender(['menu-category-details']);
        var mutable = this.state.mutable;
        return (
            <div className={classNames.join(' ')}>
              <h3>Edit Category</h3>
              <div className="inner">
                <span className="col-4">Type: </span> <select className="col-4" ref="type" value={mutable.type} onChange={ this.handleChange.bind(this, 'mutable', 'type') } >
                    <option></option>
                    <option>Food</option>
                    <option>Alcohol</option>
                </select>
                <br />
                <p><span className="col-4">Name: </span> <input className="col-6" ref="name" value={ mutable.name } onChange={ this.handleChange.bind(this, 'mutable', 'name') } /></p>
                <p><span className="col-4">Default Tax: </span> <SmartInput.SmartInput className="col-2" model={mutable} modelProp="defaultTax"
                onSave={(value: string): boolean => { this.state.mutable.defaultTax = parseFloat(value); return false; }} /></p>
                <p><span className="col-4">Note: </span> <input className="col-10" value={ mutable.note } onChange={ this.handleChange.bind(this, 'mutable', 'note') } /></p>
                <bv.SimpleConfirmView
                onCancel={() => { this.cancel() } }
                onSave={() => { this.save() } }
                onRemove={ this.state.isNew ? null : this.remove.bind(this) }
                isDirty={this.state.isDirty}
                ></bv.SimpleConfirmView>
              </div>
            </div>
        );
    }
}








export interface MenuItemEditProps {
    item: Models.MenuItem;
    category: Models.MenuCategory;
    onSave(mutable: Models.MenuItem): void;
    onCancel(): void;
    onRemove(key: string): void;
}
export interface MenuItemEditState {
    mutable?: Models.MenuItem;
    isNew?: boolean;
    isDirty?: boolean;
}
export class MenuItemEdit extends bv.SyncView<MenuItemEditProps, MenuItemEditState> {
    name: string = '      MenuItemEditView';
    shouldComponentUpdate(nextProps: MenuItemEditProps, nextState: MenuItemEditState) {
        return super.shouldComponentUpdate(nextProps, nextState) || this.state.isDirty;
    }
    constructor(props: MenuItemEditProps) {
        super(props);
        this.state = this.getState(props);
    }
    componentWillReceiveProps(nextProps: MenuItemEditProps) {
        if (this.props.item !== nextProps.item) {
            this.setState(this.getState(nextProps));
        }
    }
    getState(props: MenuItemEditProps): MenuItemEditState {
        var isNew = props.item.key ? false : true;
        var mutable = JSON.parse(JSON.stringify(props.item));
        return {
            mutable: mutable,
            isNew: isNew,
            isDirty: false
        };
    }
    cancel() {
        this.props.onCancel();
    }
    save() {
        this.props.onSave(this.state.mutable);
    }
    remove() {
        this.props.onRemove(this.props.item.key);
    }
    render() {
        var classNames = this.preRender(['menu-category-details']);
        var mutable = this.state.mutable;
        return (
            <div className={classNames.join(' ')}>
              <h3>Edit Item</h3>
              <div className="inner">
                <p><span className="col-4">Name: </span> <input className="col-6" ref="name" value={ mutable.name } onChange={ this.handleChange.bind(this, 'mutable', 'name') } /></p>
                <p><span className="col-4">Price: </span> <input className="col-2" value={ mutable.price.toString() } onChange={ this.handleChange.bind(this, 'mutable', 'price') } /></p>
                <bv.SimpleConfirmView
                onCancel={() => { this.cancel() } }
                onSave={() => { this.save() } }
                onRemove={ this.state.isNew ? null : this.remove.bind(this) }
                isDirty={this.state.isDirty}
                ></bv.SimpleConfirmView>
              </div>
            </div>
        );
    }
}









export interface MenuCategoriesProps {
    categories: { [key: string]: Models.MenuCategory };
    selectedCategory: Models.MenuCategory;
    onSelectCategory(category: Models.MenuCategory): void;
}
export class MenuCategories extends bv.SyncView<MenuCategoriesProps, any> {
    name: string = '    MenuCategories';
    render() {
        var classNames = this.preRender(['menu-categories']);
        //console.log(this.name + ': Render');
        var categories = Utils.toArray(this.props.categories);
        var nodes = categories.map((category: Models.MenuCategory) => {
            var isSelected = category === this.props.selectedCategory;
            return (<MenuCategory key={category.key} category={ category } isSelected={isSelected} onSelectCategory={ this.props.onSelectCategory.bind(this) }></MenuCategory>);
        });
        return (
            <div className={classNames.join(' ')}>
              <ul>
                { nodes }
              </ul>
            </div>
        );
    }
}




export interface MenuCategoryProps {
    key: string;
    category: Models.MenuCategory;
    isSelected: boolean;
    onSelectCategory(cateogyr: Models.MenuCategory): void;
}
export class MenuCategory extends bv.SyncView<MenuCategoryProps, bv.SyncViewState> {
    name: string = '      MenuCategory';
    render() {
        var classNames = this.preRender();
        if (this.props.isSelected) classNames.push('active');
        return (
            <li className={classNames.join(' ') } onClick={() => { this.props.onSelectCategory(this.props.category); } }>{ this.props.category.name }</li>
        );
    }
}















export interface MenuItemsProps {
    items: { [key: string]: Models.MenuItem };
    selectedItem: Models.MenuItem;
    onSelectItem(category: Models.MenuItem): void;
}

export class MenuItems extends bv.SyncView<MenuItemsProps, {}> {
    name: string = '    MenuItems';
    render() {
        var classNames = this.preRender(['menu-items']);
        //console.log(this.name + ': Render');
        var items = Utils.toArray(this.props.items);
        var nodes = items.map((item: Models.MenuItem) => {
            var isSelected = item === this.props.selectedItem;
            return (<MenuItem key={item.key} item={ item } isSelected={isSelected} onSelect={ this.props.onSelectItem.bind(this) }></MenuItem>);
        });
        return (
            <div className={classNames.join(' ')}>
              <ul>
                { nodes }
              </ul>
            </div>
        );
    }
}

export interface MenuItemProps {
    key: string;
    item: Models.MenuItem;
    onSelect: (menuItem: Models.MenuItem) => void;
    isSelected: boolean;
}
export interface MenuItemState {
    isNew: boolean;
}
export class MenuItem extends bv.SyncView<MenuItemProps, MenuItemState> {
    name: string = '          MenuItem';
    constructor(props: MenuItemProps) {
        super(props);
        this.state = { isNew: true };
    }
    render() {
        var classNames = this.preRender();
        if (this.props.isSelected) classNames.push('active');
        return (
            <li className={classNames.join(' ') } onClick={ () => { this.props.onSelect(this.props.item); } }>
              <span className="name">{this.props.item.name}</span>
              <span className="price">{ Utils.formatCurrency(this.props.item.price)}</span>
            </li>
        );
    }
}





/*export class MenuItemEditView extends bv.SimpleItemEditView {
    doFocus() {
        var input = React.findDOMNode(this.refs['name']) as any;
        input.focus();
        input.select();
    }
    render() {

        var hide = { float: 'right', display: this.props.onRemove ? 'block' : 'none' };

        return (
            <div>
          <h2>Edit Menu Item</h2>
          <div className="row"><span className="col-4">Name: </span><input className="col-6" ref="name" value={ this.state.entity.name } onChange={ this.handleChange.bind(this, "name") } /></div>
          <div className="row"><span className="col-4">Note: </span><input className="col-10" value={ this.state.entity.note } onChange={ this.handleChange.bind(this, "note") } /></div>
          <div className="row"><span className="col-4">Price: </span><input className="col-2" value={ this.state.entity.price } onChange={ this.handleChange.bind(this, "price") } /></div>
          <bv.SimpleConfirmView
          onCancel={() => { this.cancel() } }
          onSave={() => { this.save() } }
          onRemove={ this.props.onRemove ? () => { this.remove() } : null }
          isDirty={this.state.isDirty}
          ></bv.SimpleConfirmView>
            </div>
        );
    }
}*/








/*export interface MenuViewState {
    categories?: MenuCategoryModel[];
    selectedCategory?: MenuCategoryModel;
    selectedItem?: MenuItemModel;
}*/

/*export class MenuView extends React.Component<{}, MenuViewState> {
    constructor(props) {
        super(props);
    }
    handleInsertCategory(category: models.MenuCategoryModel) {
      category._id = category._id || new Date().toISOString();
      category.menuItems = category.menuItems || [];

      console.log('adding cat: ' + JSON.stringify(category));
      this.setState({
          categories: this.state.categories.concat([category]),
          selectedCategory: category,
          selectedItem: null
        });
    }
    handleInsertItem(item: models.MenuItemModel) {
      item._id = item._id || new Date().toISOString();

      console.log('adding item: ' + JSON.stringify(item));
      var categories = this.state.categories;
      for(var i = 0; i < categories.length; i++) {
        if(categories[i]._id === this.state.selectedCategory._id){
          //var category = categories.id;
        }
      }
      this.setState({
          categories: this.state.categories.concat([category]),
          selectedCategory: category,
          selectedItem: null
        });
    }
    render() {
        return (
            <div className="menu">
            {
              <MenuCategoriesView
                categories={this.state.categories}
                selectedCategory={this.state.selectedCategory}
                onCategorySelected={(category: models.MenuCategoryModel) => { this.setState({ selectedCategory: category, selectedItem: null }) } }
                onInsertCategory={ this.handleInsertCategory.bind(this) }>
              </MenuCategoriesView>
              <MenuItemsView
                menuItems={ this.state.selectedCategory ? this.state.selectedCategory.menuItems : [] }
                selectedItem={ this.state.selectedItem }
                onItemSelected={(item: models.MenuItemModel) => { this.setState({ selectedItem: item }); }}
                onInsertItem={ this.handleInsertItem.bind(this) }>
              </MenuItemsView> }
            </div>
        );
    }
}*/


/*
export interface MenuCategoriesViewProps {
    categories: models.MenuCategoryModel[];
    selectedCategory: models.MenuCategoryModel;
    onCategorySelected: (category: models.MenuCategoryModel) => void;
    onInsertCategory?: (category: models.MenuCategoryModel) => void;
}

export class MenuCategoriesView extends React.Component<MenuCategoriesViewProps, {}> {
    render() {
        var nodes = this.props.categories.map((category: models.MenuCategoryModel) => {
            var className = (this.props.selectedCategory && this.props.selectedCategory._id === category._id) ? 'active' : '';
            return (<li key={category._id} className={className} onClick={() => { this.props.onCategorySelected(category); }}>{ category.name }</li>);
        });

        return (
            <div className="menu-categories">
              <h3>Menu Categories</h3>
              <ul>
                <li>
                  <bv.Button className="btn-add" onClick={() => { (this.refs as any).addCategoryModal.toggle(); } }><span className="fa fa-plus-circle"></span> Category</bv.Button>
                </li>
                {nodes}
              </ul>


              <bv.ModalView ref="addCategoryModal" onShown={() => { (this.refs as any).addCategoryView.doFocus(); } }>
                <MenuCategoryEditView ref="addCategoryView"
                    onSave={(entity) => {
                      this.props.onInsertCategory(entity);
                      (this.refs as any).addCategoryModal.toggle();
                      }}
                    onCancel={ () => { (this.refs as any).addCategoryModal.toggle(); } }>
                </MenuCategoryEditView>
              </bv.ModalView>

            </div>
        );
    }
}*/

/*
export interface MenuItemsViewProps {
    menuItems: models.MenuItemModel[];
    selectedItem: models.MenuItemModel;
    onItemSelected: (item: models.MenuItemModel) => void;
    onInsertItem: (item: models.MenuItemModel) => void;
}
export class MenuItemsView extends React.Component<MenuItemsViewProps, any> {
    render() {
      var nodes = this.props.menuItems.map((item: models.MenuItemModel) => {
          var className = (this.props.selectedItem && this.props.selectedItem._id === item._id) ? 'active' : '';
          return (<li key={item._id} className={className} onClick={() => { this.props.onItemSelected(item); }}>{ item.name }</li>);
      });

        return (
            <div className="menu-items">
              <h3>Menu Items</h3>
              <ul>
              <li>
                <bv.Button className="btn-add" onClick={() => { (this.refs as any).addItemModal.toggle(); } }><span className="fa fa-plus-circle"></span> Item</bv.Button>
              </li>
                { nodes }
              </ul>


              <bv.ModalView ref="addMenuItemModal" onShown={() => { (this.refs as any).editItemView.doFocus(); } }>
                <MenuItemEditView ref="editItemView" entity={{}}
                    onSave={(entity) => { this.props.onInsertItem(entity); (this.refs as any).addMenuItemModal.hide(); } }
                    onCancel={() => { (this.refs as any).addMenuItemModal.toggle(); } }>
                </MenuItemEditView>
              </bv.ModalView>

            </div>
        );
    }
}
*/

/*export class MenuCategoryDetailsView extends bv.BaseItemView<bv.BaseItemViewProps, any> {

    insertMenuItem(item) {
        var newEntity = this.state.entity;
        newEntity.menuItems = newEntity.menuItems || {};
        item._id = new Date().toUTCString();
        newEntity.menuItems[item._id] = item;
        this.setState({
            isDirty: true,
            entity: newEntity
        });
        this.update();
    }

    updateMenuItem(item) {
        var newEntity = this.state.entity;
        newEntity.menuItems[item._id] = item;
        this.setState({
            isDirty: true,
            entity: newEntity
        });
        this.update();
    }

    removeMenuItem(_id) {
        var newEntity = this.state.entity;
        delete newEntity.menuItems[_id];
        this.setState({
            isDirty: true,
            entity: newEntity
        });
        this.update();
    }
    render() {
        var items = this.state.entity.menuItems || {};
        var nodes = [];
        for (var id in this.state.entity.menuItems) {
            var entity = this.state.entity.menuItems[id];

            nodes.push(
                <li key={entity._id}>{entity.name}</li>
            );
        }

        return (
            <li key={this.state.entity._id}>
              {this.state.entity.name}
              <bv.Button className="col-1" onClick={() => {(this.refs as any).editCategoryView.reset(); (this.refs as any).editCategoryModal.show(); }}><span className="fa fa-pencil"></span></bv.Button>
              <bv.Button className="col-2 btn-add" onClick={() => {(this.refs as any).addMenuItemModal.toggle(); }}><span className="fa fa-plus-circle fa-fw"></span></bv.Button>

              <bv.ModalView ref="addMenuItemModal" onShown={() => { (this.refs as any).editItemView.doFocus(); } }>
                <MenuItemEditView ref="editItemView" entity={{}}
                onSave={(entity) => { this.insertMenuItem(entity); (this.refs as any).addMenuItemModal.hide(); } }
                onCancel={() => { (this.refs as any).addMenuItemModal.toggle(); } }>
                </MenuItemEditView>
              </bv.ModalView>

              <bv.ModalView ref="editCategoryModal" onShown={() => { (this.refs as any).editCategoryView.doFocus(); } }>
                <MenuCategoryEditView ref="editCategoryView" entity={this.state.entity}
                onSave={(entity) => { this.props.onUpdate(entity); (this.refs as any).editCategoryModal.toggle(); } }
                onCancel={ () => { (this.refs as any).editCategoryModal.toggle(); } }
                onRemove={ () => { this.remove(); } }>
                </MenuCategoryEditView>
              </bv.ModalView>

              { nodes }
            }

            </li>
        );
    }
}*/

/*export class MenuCategoryEditView extends bv.SimpleItemEditView {
    doFocus() {
        var input = React.findDOMNode(this.refs['type']) as any;
        input.focus();
    }
    render() {

        return (
            <div>
          <h2>Edit Menu Category</h2>
          <br />
          <br />
          <span className="col-4">Type: </span> <select className="col-4" ref="type" value={this.state.entity.type} onChange={ this.handleChange.bind(this, "type") } >
                    <option></option>
                    <option>Food</option>
                    <option>Alcohol</option>
          </select>
          <br />
          <div className="row"><span className="col-4">Name: </span> <input className="col-6" ref="name" value={ this.state.entity.name } onChange={ this.handleChange.bind(this, "name") } /></div>
          <div className="row"><span className="col-4">Note: </span> <input className="col-10" value={ this.state.entity.note } onChange={ this.handleChange.bind(this, "note") } /></div>
          <bv.SimpleConfirmView
          onCancel={() => { this.cancel() } }
          onSave={() => { this.save() } }
          onRemove={ this.props.onRemove ? () => { this.remove() } : null }
          isDirty={this.state.isDirty}
          ></bv.SimpleConfirmView>
            </div>
        );
    }
}


export class MenuItemView extends bv.BaseItemView<bv.BaseItemViewProps, any> {
    render() {
        return (
            <div className="row" key={this.props.entity._id}>
              <div className="col-1"></div>
              <bv.Button className="col-8" onClick={() => { (this.refs as any).editModal.toggle(); } }>{ this.props.entity.name }</bv.Button>
              <div className="col-4 text-right">{ bv.Utils.FormatDollars(this.props.entity.price) }</div>
              <bv.ModalView ref="editModal" onShown={() => { (this.refs as any).editView.doFocus(); } }>
                <MenuItemEditView ref="editView" entity={this.state.entity}
                onSave={(entity) => { this.props.onUpdate(entity); (this.refs as any).editModal.toggle(); } }
                onCancel={ () => { (this.refs as any).editModal.toggle(); } }
                onRemove={ () => { this.remove(); } }>
                </MenuItemEditView>
              </bv.ModalView>
            </div>
        );
    }
}*/

/*
export class MenuItemEditView extends bv.SimpleItemEditView {
    doFocus() {
        var input = React.findDOMNode(this.refs['name']) as any;
        input.focus();
        input.select();
    }
    render() {

        var hide = { float: 'right', display: this.props.onRemove ? 'block' : 'none' };

        return (
            <div>
          <h2>Edit Menu Item</h2>
          <div className="row"><span className="col-4">Name: </span><input className="col-6" ref="name" value={ this.state.entity.name } onChange={ this.handleChange.bind(this, "name") } /></div>
          <div className="row"><span className="col-4">Note: </span><input className="col-10" value={ this.state.entity.note } onChange={ this.handleChange.bind(this, "note") } /></div>
          <div className="row"><span className="col-4">Price: </span><input className="col-2" value={ this.state.entity.price } onChange={ this.handleChange.bind(this, "price") } /></div>
          <bv.SimpleConfirmView
          onCancel={() => { this.cancel() } }
          onSave={() => { this.save() } }
          onRemove={ this.props.onRemove ? () => { this.remove() } : null }
          isDirty={this.state.isDirty}
          ></bv.SimpleConfirmView>
            </div>
        );
    }
}*/
