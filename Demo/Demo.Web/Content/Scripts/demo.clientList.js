var demo = window.demo || {};

demo.clientList = demo.clientList || {};

(function () {
    var self = demo.clientList;
    var url = {};
    var resources = {};

    var $btnAdd = $("#create");
    var $btnEdit = $("#edit");
    var $btnRemove = $("#delete");

    var dataTable = function () {

        var $dataTable = $("#ClientTable");

        function getSelectedRows() {
            return $dataTable.bootstrapTable("getSelections");
        }

        function getSelectedRowsIds() {
            return $.map(getSelectedRows(),
                function (row) {
                    return row.Id;
                });
        }

        function refreshTable() {
            $dataTable.bootstrapTable("refresh");
            self.actions.refreshState(0);
        }

        function init() {
            $dataTable.bootstrapTable({
                url: url.getClients,
                columns: [
                    {
                        field: 'Id',
                        title: resources.Id
                        //sortable: true
                    }, {
                        field: 'FullName',
                        title: resources.FullName
                        //sortable: true
                    }, {
                        field: 'BirthDate',
                        title: resources.BirthDate
                        //sortable: true
                    }, {
                        field: 'Email',
                        title: resources.Email
                        //sortable: true
                    }, {
                        field: 'Type',
                        title: resources.Type
                        //sortable: true
                    }, {
                        field: 'RegisterDate',
                        title: resources.RegisterDate
                        //sortable: true
                    }, {
                        checkbox: true
                    }
                ],
                onCheck: function (row, $element) {
                    self.actions.refreshState(getSelectedRows().length);
                },
                onUncheck: function (row, $element) {
                    self.actions.refreshState(getSelectedRows().length);
                },
                onCheckAll: function (row, $element) {
                    self.actions.refreshState(getSelectedRows().length);
                },
                onUncheckAll: function (row, $element) {
                    self.actions.refreshState(0);
                },
                onDblClickRow: function (row, $element, field) {
                    window.location = url.editClient + "/" + row.Id;
                },
                sidePagination: 'server',
                pagination: true,
                showPaginationSwitch: false,
                striped: true,
                pageList: [10, 25, 50, 'All'],
                showToggle: false,
                showColumns: false,
                showRefresh: false,
                detailView: false,
                detailFormatter: 'detailFormatter',
                height: 499,
                clickToSelect: true,
                singleSelect: false,
                search: false
            });
        };

        return {
            init: function () { init(); },
            refresh: function () { refreshTable(); },
            getSelectedRows: function () { return getSelectedRowsIds(); }
        };
    }();

    self.actions = {
        refreshState: function (selectedRowsCount) {
            if (selectedRowsCount <= 0) {
                $btnEdit.prop("disabled", true);
                $btnRemove.prop("disabled", true);
                //$btnExecute.prop('disabled', true);
            } else if (selectedRowsCount === 1) {
                $btnEdit.prop("disabled", false);
                $btnRemove.prop("disabled", false);
                //$btnExecute.prop('disabled', false);
            } else {
                $btnEdit.prop("disabled", true);
                $btnRemove.prop("disabled", false);
                //$btnExecute.prop('disabled', false);
            }
        },
        add: function () {
            window.location = url.addClient;
        },
        remove: function (ids) {
            if (!confirm(resources.removalConfirmation)) return;

            $.ajax({
                url: url.deleteClients,
                type: "POST",
                data: { clientIds: ids },
                success: function (result) {
                    if (result !== "success") alert(resources.ajaxCRUDErrorMessage + "\n\n more info: " + result);
                    dataTable.refresh();
                } //,
                //error: function() {
                    //TODO error instead of success: if (result !== "success") when errors happen
                //}
            });
        },
        edit: function (id) {
            window.location = url.editClient + "/" + id;
        }
        //execute: function (ids) {
        //	$.ajax({
        //		url: url.executeNow,
        //		type: "POST",
        //		data: { clientIds: ids },
        //		success: function (data) {
        //			alert(resources.importSchedulingNotification);
        //			dataTable.refresh();
        //		}
        //	});
        //}
    };

    self.init = function (urlList, res) {
        url = urlList;
        resources = res;

        dataTable.init();
    };

    self.initEvents = function () {
        // disabling edit/delete buttons
        self.actions.refreshState(0);

        $btnAdd.click(function () {
            self.actions.add();
        });

        $btnEdit.click(function () {
            var selectedRow = dataTable.getSelectedRows();
            if (selectedRow && selectedRow.length === 1) {
                self.actions.edit(selectedRow[0]);
            }
        });

        $btnRemove.click(function () {
            var selectedRows = dataTable.getSelectedRows();
            if (selectedRows && selectedRows.length > 0) {
                self.actions.remove(selectedRows);
            }
        });
        $('#search').on("click", function () {
            alert("NotImplementedError");
            throw { name: "NotImplementedError", message: "TODO: YEH: search functionality when asked to." };
            $("#ClientTable").bootstrapTable('refresh',
                {
                    query: {
                        search: JSON.stringify($('#form-filter').serializeObject())
                    }

                });
        });

    };
})();