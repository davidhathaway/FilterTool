/// <reference path="../typings/jquery/jquery.d.ts" />
/// <reference path="../typings/knockout/knockout.d.ts" />
/// <reference path="../typings/knockout.mapper/knockout.mapper.d.ts" />
 
class FilterAppKoModel
{
    public FilterGroups: KnockoutObservableArray<FilterGroupKoModel>;
    public FilterGroupOperators: FilterOperator[];
    public NumericDateFilterOperators: FilterOperator[];
    public StringFilterOperators: FilterOperator[];
    public AppTitle: KnockoutComputed<string>;
    public ShowAdd: KnockoutComputed<boolean>;

    public GroupFilterGroup: FilterGroupKoModel;
    public GroupFilterFilter: FilterItemKoModel;

    public InlineDialogOnOk: any;
    public InlineDialogOnCancel: any;
    public InlineDialogText: KnockoutObservable<string>;
    public InlineDialogStarted: KnockoutObservable<boolean>;
    public InlineDialogTemplateName: KnockoutObservable<string>;

    public SelectedOperator: KnockoutObservable<string>;

    public FilterName: KnockoutObservable<string>;
    public FilterOp: KnockoutObservable<string>;
    public FilterValue: KnockoutObservable<string>;
    public FilterGroupOp: KnockoutObservable<string>;
    public ShowFilterGroupOp: KnockoutObservable<boolean>;

    constructor()
    {
        this.AppTitle = ko.computed(() => { return "Filters 123" });
        this.FilterGroups = ko.observableArray([]);
        this.FilterGroupOperators = [];
        this.FilterGroupOperators.push(new FilterOperator("And","&&", "1"));
        this.FilterGroupOperators.push(new FilterOperator("Or","||", "2"));

        var equal = new FilterOperator("Equal To","=", "1");
        var notEqual = new FilterOperator("Not Equal To","!=", "2");

        this.NumericDateFilterOperators = [];
        this.NumericDateFilterOperators.push(equal);
        this.NumericDateFilterOperators.push(notEqual);
        this.NumericDateFilterOperators.push(new FilterOperator("Less Than",">", "3"));
        this.NumericDateFilterOperators.push(new FilterOperator("Less Than Or Equal To",">=", "4"));
        this.NumericDateFilterOperators.push(new FilterOperator("Greater Than","<", "5"));
        this.NumericDateFilterOperators.push(new FilterOperator("Greater Than Or Equal To","<=", "6"));

        
        this.StringFilterOperators = [];
        this.StringFilterOperators.push(equal);
        this.StringFilterOperators.push(notEqual);
        //this.StringFilterOperators.push(new FilterOperator("Like", "7"));

        this.ShowAdd = ko.computed(() => {

            return this.FilterGroups().length == 0;

        });

        this.InlineDialogStarted = ko.observable(false);
        this.InlineDialogText = ko.observable(null);
        this.InlineDialogTemplateName = ko.observable(null);
        this.SelectedOperator = ko.observable("");

        this.FilterGroupOp = ko.observable("");
        this.FilterName = ko.observable("");
        this.FilterValue = ko.observable("");
        this.FilterOp = ko.observable("");
        this.ShowFilterGroupOp = ko.observable(false);
    }

    AddFilter(name: string, value: string, dataType: string, valueOpValue: string, parent?: FilterGroupKoModel, groupOpValue?: string)
    {
        var group = new FilterGroupKoModel(this);
        if (parent) {
            group.SetParent(parent);
        }
        group.AddFilter(name, value, dataType, valueOpValue, groupOpValue);
        this.FilterGroups.push(group);
    }

    OnAddFirstGroup()
    {
        this.AddEditFilter();
    }

    EnableFilterGrouping(group: FilterGroupKoModel, filter: FilterItemKoModel)
    {
        this.InlineDialogTemplateName("pr-group-filter");
        this.InlineDialogText("Pick the filters you want to group { }");

        this.GroupFilterGroup = group;

        this.GroupFilterFilter = filter;

        var filters = group.FilterItems();

        for (var i = 0; i < filters.length; i++)
        {
            if (filter == filters[i]) {
                filters[i].EnableGroupFilter(true);
            } else {
                filters[i].EnableGroupFilter(false);
            }
        }

        var self = this;

        this.InlineDialogOnCancel = function ()
        {
            var filters = self.GroupFilterGroup.FilterItems();
            for (var i = 0; i < filters.length; i++) {
                filters[i].DisableGroupFilter();
            }
        };

        this.InlineDialogOnOk = function ()
        {
            var selectedFilters = [];

            var filters = self.GroupFilterGroup.FilterItems();

            for (var i = 0; i < filters.length; i++) {
                if (filters[i].GroupFilterCheckbox()) {
                    selectedFilters.push(filters[i]);
                }
            }
            self.InlineDialogOnCancel();
            if (selectedFilters.length > 1)
            {
                self.GroupFilterGroup.AddChildGroupWithFilters(selectedFilters);
            }

       
        };

        this.InlineDialogStarted(true);
    }

    PickGroupFilterOperator(currentOp: string, callback: any) {
        if (!callback) {
            return;
        }

        this.InlineDialogTemplateName("pr-select-op");
        this.InlineDialogText("Pick the operator you want to apply");
        this.InlineDialogStarted(true);
        var self = this;
        this.SelectedOperator(currentOp);
        this.InlineDialogOnOk = function () {
            var templateDiv = $("#inline-dialog-template");
            var groupOpValue = self.SelectedOperator();
            var groupOp = null;
            if (groupOpValue) {
                for (var i = 0; i < self.FilterGroupOperators.length; i++) {
                    if (self.FilterGroupOperators[i].Value == groupOpValue) {
                        groupOp = self.FilterGroupOperators[i];
                        break;
                    }
                }
            }

            if (groupOp) {
                callback(groupOp);
                self.OnCancelInlineDialog();
            }

        };
        this.InlineDialogOnCancel = function () {

        };
    }

    AddEditFilter(group?: FilterGroupKoModel, editFilter?: FilterItemKoModel)
    {
        this.InlineDialogTemplateName("pr-crud-filter");
        this.InlineDialogText("Please enter the filter details.");
        this.InlineDialogStarted(true);

        var self = this;

        this.ShowFilterGroupOp(true);
        this.FilterName("");
        this.FilterOp("1");
        this.FilterValue("");
        this.FilterGroupOp("1");

        if (group == null && editFilter == null)
        {
            this.ShowFilterGroupOp(false);
        }

        if (group != null && group.FilterItems().length == 0)
        {
            this.ShowFilterGroupOp(false);
        }

        if (editFilter != null) {
            this.FilterName(editFilter.Name());

            this.FilterOp(editFilter.ValueOperator().Value);

            this.FilterValue(editFilter.Value());

            if (editFilter.GroupOperator() != null) {
                this.FilterGroupOp(editFilter.GroupOperator().Value);
            }
            else {
                this.ShowFilterGroupOp(false);
            }
        }

        this.InlineDialogOnOk = function ()
        {
            var groupOpValue = self.ShowFilterGroupOp() ? self.FilterGroupOp() : null;
            if (group == null)
            {
                self.AddFilter(self.FilterName(), self.FilterValue(), "string", self.FilterOp());
            }
            else if (editFilter == null && group != null) {

                group.AddFilter(self.FilterName(), self.FilterValue(), "string", self.FilterOp(), groupOpValue);
            }
            else
            {
                editFilter.Name(self.FilterName());
                editFilter.Value(self.FilterValue());

                var valueOp = null;
                for (var i = 0; i < self.StringFilterOperators.length; i++) {
                    if (self.StringFilterOperators[i].Value == self.FilterOp()) {
                        valueOp = self.StringFilterOperators[i];
                        break;
                    }
                }

                var groupOp = null;
                if (groupOpValue) {
                    for (var i = 0; i < self.FilterGroupOperators.length; i++) {
                        if (self.FilterGroupOperators[i].Value == groupOpValue) {
                            groupOp = self.FilterGroupOperators[i];
                            break;
                        }
                    }
                }

                editFilter.ValueOperator(valueOp);
                if (self.ShowFilterGroupOp() && groupOp)
                {
                    editFilter.GroupOperator(groupOp);
                }
            }

            self.OnCancelInlineDialog();

        };

        this.InlineDialogOnCancel = function () {

        };
    }

    OnCancelInlineDialog()
    {
        this.InlineDialogStarted(false);
        if (this.InlineDialogOnCancel) {
            this.InlineDialogOnCancel();
        }
    }

    OnOkInlineDialog() {
        this.InlineDialogStarted(false);
        if (this.InlineDialogOnOk) {
            this.InlineDialogOnOk();
        }
    }

    Simplify()
    {
        var simplified = true;

        while (simplified) {
            simplified = false;
            var filterGroups = this.FilterGroups();
            for (var i = 0; i < filterGroups.length; i++) {
                var group = filterGroups[i];
                if (!group.HasChildren() && group.FilterItems().length == 0) {
                    //remove empty groups.
                    this.FilterGroups.remove(group);
                    simplified = true;
                } else {
                    simplified = group.Simplify();
                }
            }
        }
    }
}

class FilterOperator
{
    public Name: string;
    public ShortName: string;
    public Value: string;
    constructor(name: string, shortName: string, value: string)
    {
        this.Name = name;
        this.Value = value;
        this.ShortName = shortName;
    }
}

class FilterGroupKoModel
{
    public App: FilterAppKoModel;
    public GroupTitle: KnockoutComputed<string>;
    public HasChildren: KnockoutComputed<boolean>;
    public Parent: KnockoutObservable<FilterGroupKoModel>;
    public Children: KnockoutObservableArray<FilterGroupKoModel>;
    public FilterItems: KnockoutObservableArray<FilterItemKoModel>;
    public GroupOperatorText: KnockoutComputed<string>;
    public GroupOperator: KnockoutObservable<FilterOperator>;
    public HasGroupOperator: KnockoutComputed<boolean>;
    public ShowGroupOperator: KnockoutComputed<boolean>;

    constructor(app: FilterAppKoModel, /*filter?: FilterItemKoModel,*/ groupOp?: FilterOperator)
    {
        var self = this;
        this.FilterItems = ko.observableArray([]);
        this.App = app;
        this.Parent = ko.observable(null);
        this.Children = ko.observableArray([]);
        this.GroupTitle = ko.computed(() => {
            return "Group";
        });

        this.HasChildren = ko.computed(() =>
        {
            return this.Children().length > 0;
        });

        this.GroupOperator = ko.observable(null);

        if (groupOp)
        {
            this.GroupOperator(groupOp);
     
        
        }

        this.GroupOperatorText = ko.computed(() => {
            if (self.GroupOperator() != null) {
                return self.GroupOperator().Name;
            }
            return "Error";
        });

        this.HasGroupOperator = ko.computed(() => {
            return self.GroupOperator() != null;
        });

        this.ShowGroupOperator = ko.computed(() => {

            if (this.GroupOperator() != null)
            {
                if (this.Parent() != null) {
                    var isFirst = this.Parent().Children()[0] == this;
                    var isOnlyOne = this.Parent().Children().length == 0;
                    var hasFilters = this.Parent().FilterItems().length > 0;

                    if (isFirst)
                    {
                        if (hasFilters) {
                            return true;
                        }
                        else {
                            return false;
                        }
                    }
                    else
                    {
                        return true;
                    }
                }
                else
                {
                    return false;
                }
            }
            return false;
        });

    }

    Simplify()
    {
        var simplified = false;
        var parent = this.Parent();
        var filters = this.FilterItems();

        if (parent != null && !this.HasChildren() && filters.length == 0)
        {
            //the group is empty
            parent.Children.remove(this);
            this.Parent(null);
            return true;
        }
 
        if (parent != null && !this.HasChildren() && filters.length == 1)
        {
            //do i have a single filter and no children and a parent to move it to
            //then simplify by putting the filter into my parent the filter op becomes my group op
            var lastFilter = this.FilterItems()[0];
            lastFilter.GroupOperator(this.GroupOperator());
            parent.MoveFilter(lastFilter);
             
            return true;
        }

        if (this.HasChildren() && filters.length == 0 && this.Parent() != null) {
            
            //if i have children but no filter items move my children to my parent.
            //move all my children to my parent
            var children = this.Children();
       
            for (var i = 0; i < children.length; i++) {
                var child = children[i];
                child.SetParent(parent);
            }
            this.Children.removeAll();
            parent.Children.remove(this);
            this.Parent(null);
            return true;
        }

        if (parent != null && !this.HasChildren() && filters.length > 0 && parent.FilterItems().length == 0 && parent.Children().length == 1)
        {
            //if my parent is not null and i dont have children and i have filters
            //and my parent does't have groups or filters. (other than me)

            var filtersToMove = filters.map((v, index, arr) => {
                return v;
            });

            for (var i = 0; i < filtersToMove.length; i++) {
                parent.MoveFilter(filtersToMove[i]);
            }

            parent.Children.remove(this);
            this.Parent(null);
            return true;
        }


        //also simplify my children
        var children = this.Children();
        for (var i = 0; i < children.length; i++)
        {
            simplified = children[i].Simplify();
            if (simplified)
            {
                return true;
            }
        }

        this.UpdateCanGroup();

        return false;
    }

    GetAccendantCount()
    {
        var count = 0;
        if (this.Parent() != null)
        {
            count++;
            count += this.Parent().GetAccendantCount();
        }
        return count;
    }

    SetParent(parent: FilterGroupKoModel)
    {
        this.Parent(parent);
        parent.Children.push(this);
    }

    OnAddFilter()
    {
        this.App.AddEditFilter(this);
    }

    OnGroupOperatorClick() {
        var self = this;
        this.App.PickGroupFilterOperator(this.GroupOperator().Value, function (op) {
            self.GroupOperator(op);
        });
    }

    AddChildGroupWithFilters(filters: FilterItemKoModel[])
    {
        var group = new FilterGroupKoModel(this.App, this.App.FilterGroupOperators[0]);
        group.SetParent(this);
        for (var i = 0; i < filters.length; i++) {
            group.MoveFilter(filters[i]);
        }
        this.UpdateCanGroup();
        return group;
    }

    AddFilter(name: string, value: string, dataType: string, valueOpValue: string, groupOpValue?: string) {
        var filters = this.App.StringFilterOperators;
        var valueOp = null;
        var groupOp = null;

        switch (dataType) {
            case "String":
                filters = this.App.StringFilterOperators;
                break;
            case "NumericDate":
                filters = this.App.NumericDateFilterOperators;
                break;
        }

        for (var i = 0; i < filters.length; i++) {
            if (filters[i].Value == valueOpValue) {
                valueOp = filters[i];
                break;
            }
        }

        if (groupOpValue) {
            for (var i = 0; i < this.App.FilterGroupOperators.length; i++) {
                if (this.App.FilterGroupOperators[i].Value == groupOpValue) {
                    groupOp = this.App.FilterGroupOperators[i];
                    break;
                }
            }
        }

        if (name && value && valueOp)
        {
            var filterItem = new FilterItemKoModel(name, value, valueOp, groupOp);
            filterItem.Group(this);
            this.FilterItems.push(filterItem);
        }

        this.UpdateCanGroup();
    }

    MoveFilter(filter: FilterItemKoModel)
    {
        var filterGroup = filter.Group();
        filterGroup.FilterItems.remove(filter); 
        filter.Group(this);
        this.FilterItems.push(filter);
        this.UpdateCanGroup();
    }

    UpdateCanGroup()
    {
        var filters = this.FilterItems();
        for (var i = 0; i < filters.length; i++)
        {
            filters[i].UpdateCanGroup();
        }
    }
}

class FilterItemKoModel
{
    public Group:  KnockoutObservable<FilterGroupKoModel>;
    public Name: KnockoutObservable<string>;
    public Value: KnockoutObservable<string>;
    public ValueOperator: KnockoutObservable<FilterOperator>;
    public ValueOperatorText: KnockoutComputed<string>;
    public GroupOperator: KnockoutObservable<FilterOperator>;
    public GroupOperatorText: KnockoutComputed<string>;
    public HasGroupOperator: KnockoutComputed<boolean>;
    public CanGroup: KnockoutObservable<boolean>;
    public EnableGroupFilterCheckbox: KnockoutObservable<boolean>;
    public GroupFilterCheckbox: KnockoutObservable<boolean>;
    public GroupFilterCheckboxEnableAttr: KnockoutObservable<boolean>;


    public IsFirst: KnockoutComputed<boolean>;

    constructor(name: string, value: string, valueOperator: FilterOperator, groupOperator?: FilterOperator)
    {
        this.Group = ko.observable(null);
        this.Name = ko.observable(name);
        this.Value = ko.observable(value);
        this.ValueOperator = ko.observable(valueOperator);
        this.ValueOperatorText = ko.computed(() => {
            return this.ValueOperator().ShortName;
        });
        this.GroupOperator = ko.observable(null);

        if (groupOperator) {
            this.GroupOperator(groupOperator);
         
        }

        this.GroupOperatorText = ko.computed(() =>
        {
            if (this.GroupOperator() != null) {
                return this.GroupOperator().Name;
            }
            return "Error";
        });


        this.HasGroupOperator = ko.computed(() =>
        {
            var hasGroup = this.GroupOperator() != null
            return hasGroup;  
        });


        this.IsFirst = ko.computed(() => {
            if (this.Group() != null) {
                return this == this.Group().FilterItems()[0];
            } else {
                return false;
            }
        });

        this.CanGroup = ko.observable(false);

        this.EnableGroupFilterCheckbox = ko.observable(false);

        this.GroupFilterCheckbox = ko.observable(false);

        this.GroupFilterCheckboxEnableAttr = ko.observable(true);

        this.GroupFilterCheckbox.subscribe((newValue) =>
        {
            //can't select all checkbox's in a group
            if (this.Group() == null)
            {
                return;
            }
            var group = this.Group();
            var count = 0;
            var filters = group.FilterItems();
            for (var i = 0; i < filters.length; i++) {
                if (filters[i].GroupFilterCheckbox()) {
                    count++;
                }
            }

            var hasChildren = group.HasChildren();

            var disableLastFilter = count == (filters.length - 1);

            if (disableLastFilter && !hasChildren)
            {
                //disable last
                for (var i = 0; i < filters.length; i++) {
                    if (!filters[i].GroupFilterCheckbox()) {
                        filters[i].GroupFilterCheckboxEnableAttr(false);
                    }
                }
            }
            else {
                //enable all
                for (var i = 0; i < filters.length; i++) {
                    filters[i].GroupFilterCheckboxEnableAttr(true);
                }
            }

        });




        this.UpdateCanGroup();
    }
    OnOperatorClick() {
        var self = this;
        this.Group().App.PickGroupFilterOperator(this.GroupOperator().Value,function (op) {
            self.GroupOperator(op);
        });
    }

    UpdateCanGroup()
    {
        if (this.Group() != null)
        {
            var hasChildren = this.Group().Children().length > 0;

            if (hasChildren)
            {
                return this.CanGroup(this.Group().FilterItems().length > 1);
            }
            else
            {
                return this.CanGroup(this.Group().FilterItems().length > 2);
            }
        } 
    }

    OnEditFilter()
    {
        if (!this.Group().App.InlineDialogStarted()) {
            this.Group().App.AddEditFilter(this.Group(), this);
        }
    }

    OnRemoveFilter()
    {
        var group = this.Group();
        var app = group.App;
        group.FilterItems.remove(this);
        this.Group(null);
        app.Simplify();
    }

    OnGroupFilter()
    {
        this.Group().App.EnableFilterGrouping(this.Group(), this);
    }

    EnableGroupFilter(selected:boolean)
    {
        this.EnableGroupFilterCheckbox(true);
        this.GroupFilterCheckbox(selected);
    }

    DisableGroupFilter()
    {
        this.EnableGroupFilterCheckbox(false);
    }
}


$(document).ready(function ()
{
    var app = new FilterAppKoModel();
 
    ko.applyBindings(app);
});


