/// <reference path="../typings/jquery/jquery.d.ts" />
/// <reference path="../typings/knockout/knockout.d.ts" />
/// <reference path="../typings/knockout.mapper/knockout.mapper.d.ts" />
var FilterAppKoModel = (function () {
    function FilterAppKoModel() {
        var _this = this;
        this.AppTitle = ko.computed(function () {
            return "Filters 123";
        });
        this.FilterGroups = ko.observableArray([]);
        this.FilterGroupOperators = [];
        this.FilterGroupOperators.push(new FilterOperator("And", "&&", "1"));
        this.FilterGroupOperators.push(new FilterOperator("Or", "||", "2"));
        var equal = new FilterOperator("Equal To", "=", "1");
        var notEqual = new FilterOperator("Not Equal To", "!=", "2");
        this.NumericDateFilterOperators = [];
        this.NumericDateFilterOperators.push(equal);
        this.NumericDateFilterOperators.push(notEqual);
        this.NumericDateFilterOperators.push(new FilterOperator("Less Than", ">", "3"));
        this.NumericDateFilterOperators.push(new FilterOperator("Less Than Or Equal To", ">=", "4"));
        this.NumericDateFilterOperators.push(new FilterOperator("Greater Than", "<", "5"));
        this.NumericDateFilterOperators.push(new FilterOperator("Greater Than Or Equal To", "<=", "6"));
        this.StringFilterOperators = [];
        this.StringFilterOperators.push(equal);
        this.StringFilterOperators.push(notEqual);
        //this.StringFilterOperators.push(new FilterOperator("Like", "7"));
        this.ShowAdd = ko.computed(function () {
            return _this.FilterGroups().length == 0;
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
    FilterAppKoModel.prototype.AddFilter = function (name, value, dataType, valueOpValue, parent, groupOpValue) {
        var group = new FilterGroupKoModel(this);
        if (parent) {
            group.SetParent(parent);
        }
        group.AddFilter(name, value, dataType, valueOpValue, groupOpValue);
        this.FilterGroups.push(group);
    };
    FilterAppKoModel.prototype.OnAddFirstGroup = function () {
        this.AddEditFilter();
    };
    FilterAppKoModel.prototype.EnableFilterGrouping = function (group, filter) {
        this.InlineDialogTemplateName("pr-group-filter");
        this.InlineDialogText("Pick the filters you want to group { }");
        this.GroupFilterGroup = group;
        this.GroupFilterFilter = filter;
        var filters = group.FilterItems();
        for (var i = 0; i < filters.length; i++) {
            if (filter == filters[i]) {
                filters[i].EnableGroupFilter(true);
            }
            else {
                filters[i].EnableGroupFilter(false);
            }
        }
        var self = this;
        this.InlineDialogOnCancel = function () {
            var filters = self.GroupFilterGroup.FilterItems();
            for (var i = 0; i < filters.length; i++) {
                filters[i].DisableGroupFilter();
            }
        };
        this.InlineDialogOnOk = function () {
            var selectedFilters = [];
            var filters = self.GroupFilterGroup.FilterItems();
            for (var i = 0; i < filters.length; i++) {
                if (filters[i].GroupFilterCheckbox()) {
                    selectedFilters.push(filters[i]);
                }
            }
            self.InlineDialogOnCancel();
            if (selectedFilters.length > 1) {
                self.GroupFilterGroup.AddChildGroupWithFilters(selectedFilters);
            }
        };
        this.InlineDialogStarted(true);
    };
    FilterAppKoModel.prototype.PickGroupFilterOperator = function (currentOp, callback) {
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
    };
    FilterAppKoModel.prototype.AddEditFilter = function (group, editFilter) {
        this.InlineDialogTemplateName("pr-crud-filter");
        this.InlineDialogText("Please enter the filter details.");
        this.InlineDialogStarted(true);
        var self = this;
        this.ShowFilterGroupOp(true);
        this.FilterName("");
        this.FilterOp("1");
        this.FilterValue("");
        this.FilterGroupOp("1");
        if (group == null && editFilter == null) {
            this.ShowFilterGroupOp(false);
        }
        if (group != null && group.FilterItems().length == 0) {
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
        this.InlineDialogOnOk = function () {
            var groupOpValue = self.ShowFilterGroupOp() ? self.FilterGroupOp() : null;
            if (group == null) {
                self.AddFilter(self.FilterName(), self.FilterValue(), "string", self.FilterOp());
            }
            else if (editFilter == null && group != null) {
                group.AddFilter(self.FilterName(), self.FilterValue(), "string", self.FilterOp(), groupOpValue);
            }
            else {
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
                if (self.ShowFilterGroupOp() && groupOp) {
                    editFilter.GroupOperator(groupOp);
                }
            }
            self.OnCancelInlineDialog();
        };
        this.InlineDialogOnCancel = function () {
        };
    };
    FilterAppKoModel.prototype.OnCancelInlineDialog = function () {
        this.InlineDialogStarted(false);
        if (this.InlineDialogOnCancel) {
            this.InlineDialogOnCancel();
        }
    };
    FilterAppKoModel.prototype.OnOkInlineDialog = function () {
        this.InlineDialogStarted(false);
        if (this.InlineDialogOnOk) {
            this.InlineDialogOnOk();
        }
    };
    FilterAppKoModel.prototype.Simplify = function () {
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
                }
                else {
                    simplified = group.Simplify();
                }
            }
        }
    };
    return FilterAppKoModel;
})();
var FilterOperator = (function () {
    function FilterOperator(name, shortName, value) {
        this.Name = name;
        this.Value = value;
        this.ShortName = shortName;
    }
    return FilterOperator;
})();
var FilterGroupKoModel = (function () {
    function FilterGroupKoModel(app, /*filter?: FilterItemKoModel,*/ groupOp) {
        var _this = this;
        var self = this;
        this.FilterItems = ko.observableArray([]);
        this.App = app;
        this.Parent = ko.observable(null);
        this.Children = ko.observableArray([]);
        this.GroupTitle = ko.computed(function () {
            return "Group";
        });
        this.HasChildren = ko.computed(function () {
            return _this.Children().length > 0;
        });
        this.GroupOperator = ko.observable(null);
        if (groupOp) {
            this.GroupOperator(groupOp);
        }
        this.GroupOperatorText = ko.computed(function () {
            if (self.GroupOperator() != null) {
                return self.GroupOperator().Name;
            }
            return "Error";
        });
        this.HasGroupOperator = ko.computed(function () {
            return self.GroupOperator() != null;
        });
        this.ShowGroupOperator = ko.computed(function () {
            if (_this.GroupOperator() != null) {
                if (_this.Parent() != null) {
                    var isFirst = _this.Parent().Children()[0] == _this;
                    var isOnlyOne = _this.Parent().Children().length == 0;
                    var hasFilters = _this.Parent().FilterItems().length > 0;
                    if (isFirst) {
                        if (hasFilters) {
                            return true;
                        }
                        else {
                            return false;
                        }
                    }
                    else {
                        return true;
                    }
                }
                else {
                    return false;
                }
            }
            return false;
        });
    }
    FilterGroupKoModel.prototype.Simplify = function () {
        var simplified = false;
        var parent = this.Parent();
        var filters = this.FilterItems();
        if (parent != null && !this.HasChildren() && filters.length == 0) {
            //the group is empty
            parent.Children.remove(this);
            this.Parent(null);
            return true;
        }
        if (parent != null && !this.HasChildren() && filters.length == 1) {
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
        if (parent != null && !this.HasChildren() && filters.length > 0 && parent.FilterItems().length == 0 && parent.Children().length == 1) {
            //if my parent is not null and i dont have children and i have filters
            //and my parent does't have groups or filters. (other than me)
            var filtersToMove = filters.map(function (v, index, arr) {
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
        for (var i = 0; i < children.length; i++) {
            simplified = children[i].Simplify();
            if (simplified) {
                return true;
            }
        }
        this.UpdateCanGroup();
        return false;
    };
    FilterGroupKoModel.prototype.GetAccendantCount = function () {
        var count = 0;
        if (this.Parent() != null) {
            count++;
            count += this.Parent().GetAccendantCount();
        }
        return count;
    };
    FilterGroupKoModel.prototype.SetParent = function (parent) {
        this.Parent(parent);
        parent.Children.push(this);
    };
    FilterGroupKoModel.prototype.OnAddFilter = function () {
        this.App.AddEditFilter(this);
    };
    FilterGroupKoModel.prototype.OnGroupOperatorClick = function () {
        var self = this;
        this.App.PickGroupFilterOperator(this.GroupOperator().Value, function (op) {
            self.GroupOperator(op);
        });
    };
    FilterGroupKoModel.prototype.AddChildGroupWithFilters = function (filters) {
        var group = new FilterGroupKoModel(this.App, this.App.FilterGroupOperators[0]);
        group.SetParent(this);
        for (var i = 0; i < filters.length; i++) {
            group.MoveFilter(filters[i]);
        }
        this.UpdateCanGroup();
        return group;
    };
    FilterGroupKoModel.prototype.AddFilter = function (name, value, dataType, valueOpValue, groupOpValue) {
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
        if (name && value && valueOp) {
            var filterItem = new FilterItemKoModel(name, value, valueOp, groupOp);
            filterItem.Group(this);
            this.FilterItems.push(filterItem);
        }
        this.UpdateCanGroup();
    };
    FilterGroupKoModel.prototype.MoveFilter = function (filter) {
        var filterGroup = filter.Group();
        filterGroup.FilterItems.remove(filter);
        filter.Group(this);
        this.FilterItems.push(filter);
        this.UpdateCanGroup();
    };
    FilterGroupKoModel.prototype.UpdateCanGroup = function () {
        var filters = this.FilterItems();
        for (var i = 0; i < filters.length; i++) {
            filters[i].UpdateCanGroup();
        }
    };
    return FilterGroupKoModel;
})();
var FilterItemKoModel = (function () {
    function FilterItemKoModel(name, value, valueOperator, groupOperator) {
        var _this = this;
        this.Group = ko.observable(null);
        this.Name = ko.observable(name);
        this.Value = ko.observable(value);
        this.ValueOperator = ko.observable(valueOperator);
        this.ValueOperatorText = ko.computed(function () {
            return _this.ValueOperator().ShortName;
        });
        this.GroupOperator = ko.observable(null);
        if (groupOperator) {
            this.GroupOperator(groupOperator);
        }
        this.GroupOperatorText = ko.computed(function () {
            if (_this.GroupOperator() != null) {
                return _this.GroupOperator().Name;
            }
            return "Error";
        });
        this.HasGroupOperator = ko.computed(function () {
            var hasGroup = _this.GroupOperator() != null;
            return hasGroup;
        });
        this.IsFirst = ko.computed(function () {
            if (_this.Group() != null) {
                return _this == _this.Group().FilterItems()[0];
            }
            else {
                return false;
            }
        });
        this.CanGroup = ko.observable(false);
        this.EnableGroupFilterCheckbox = ko.observable(false);
        this.GroupFilterCheckbox = ko.observable(false);
        this.GroupFilterCheckboxEnableAttr = ko.observable(true);
        this.GroupFilterCheckbox.subscribe(function (newValue) {
            //can't select all checkbox's in a group
            if (_this.Group() == null) {
                return;
            }
            var group = _this.Group();
            var count = 0;
            var filters = group.FilterItems();
            for (var i = 0; i < filters.length; i++) {
                if (filters[i].GroupFilterCheckbox()) {
                    count++;
                }
            }
            var hasChildren = group.HasChildren();
            var disableLastFilter = count == (filters.length - 1);
            if (disableLastFilter && !hasChildren) {
                for (var i = 0; i < filters.length; i++) {
                    if (!filters[i].GroupFilterCheckbox()) {
                        filters[i].GroupFilterCheckboxEnableAttr(false);
                    }
                }
            }
            else {
                for (var i = 0; i < filters.length; i++) {
                    filters[i].GroupFilterCheckboxEnableAttr(true);
                }
            }
        });
        this.UpdateCanGroup();
    }
    FilterItemKoModel.prototype.OnOperatorClick = function () {
        var self = this;
        this.Group().App.PickGroupFilterOperator(this.GroupOperator().Value, function (op) {
            self.GroupOperator(op);
        });
    };
    FilterItemKoModel.prototype.UpdateCanGroup = function () {
        if (this.Group() != null) {
            var hasChildren = this.Group().Children().length > 0;
            if (hasChildren) {
                return this.CanGroup(this.Group().FilterItems().length > 1);
            }
            else {
                return this.CanGroup(this.Group().FilterItems().length > 2);
            }
        }
    };
    FilterItemKoModel.prototype.OnEditFilter = function () {
        if (!this.Group().App.InlineDialogStarted()) {
            this.Group().App.AddEditFilter(this.Group(), this);
        }
    };
    FilterItemKoModel.prototype.OnRemoveFilter = function () {
        var group = this.Group();
        var app = group.App;
        group.FilterItems.remove(this);
        this.Group(null);
        app.Simplify();
    };
    FilterItemKoModel.prototype.OnGroupFilter = function () {
        this.Group().App.EnableFilterGrouping(this.Group(), this);
    };
    FilterItemKoModel.prototype.EnableGroupFilter = function (selected) {
        this.EnableGroupFilterCheckbox(true);
        this.GroupFilterCheckbox(selected);
    };
    FilterItemKoModel.prototype.DisableGroupFilter = function () {
        this.EnableGroupFilterCheckbox(false);
    };
    return FilterItemKoModel;
})();
$(document).ready(function () {
    var app = new FilterAppKoModel();
    ko.applyBindings(app);
});
//# sourceMappingURL=filterApp.js.map