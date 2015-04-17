var todoItemCollection;
window.onload = function() {
	todoItemCollection = new TodoItemCollection("notes");
	todoItemCollection.refreshItemsSummaryFunction = RefreshItemsSummary;
	todoItemCollection.DeleteItemsFunction = DeleteItems;
	todoItemCollection.addItem("ttttttttttttsssss", TodoItem.COMPLETED);
	todoItemCollection.addItem("HHHHHHH", TodoItem.ACTIVE);
	todoItemCollection.addItem("sssssssssssss", TodoItem.COMPLETED);

	//为三个filter标签绑定click事件
	var filters = document.getElementsByClassName("radio");
	for (var i = 0; i < filters.length; i++) {
		(function(num) {
			filters[i].onclick = function() {
				if (this.value == "showAllItems") {
					todoItemCollection.showItemsByState();
				} else if (this.value == "showActiveItems") {
					todoItemCollection.showItemsByState(TodoItem.ACTIVE);
				} else if (this.value == "showCompletedItems") {
					todoItemCollection.showItemsByState(TodoItem.COMPLETED);
				}
				var filterLabels = this.parentNode.parentNode.getElementsByTagName("label");
				for (var j = 0; j < filterLabels.length; j++) {
					if (j === num) {
						filterLabels[j].setAttribute("style", "color:black;")
					} else {
						filterLabels[j].setAttribute("style", "color:rgba(131, 117, 146,1);")
					}
				}
			}
		})(i);
	}


	//为“clear completed”按钮绑定事件
	document.getElementById("btnClearCompletedItems").onclick = function() {
		todoItemCollection.deleteItemsByState(TodoItem.COMPLETED);
		RefreshItemsSummary();
	}


	//为“chkToggleAllItemState”绑定事件，切换所有item为active或completed
	document.getElementById("chkToggleAllItemState").onclick = function() {
		if (this.checked) {
			this.parentNode.setAttribute("style", "color:rgba(0,0,0,0.8)");
			todoItemCollection.changeAllItemsStateTo(TodoItem.COMPLETED);
		} else {
			this.parentNode.setAttribute("style", "color:rgba(0,0,0,0.2)");
			todoItemCollection.changeAllItemsStateTo(TodoItem.ACTIVE);
		}
		RefreshItemsSummary();
	}


	//为输入新item的文本框绑定键盘事件
	document.getElementById("txtNewTodo").onkeydown = function(event) {
		if (this.value == "") {
			return;
		}
		var e = event || window.event; //处理兼容
		if (e.keyCode == 13) {
			todoItemCollection.addItem(this.value, TodoItem.ACTIVE);
			RefreshItemsSummary();
			this.value = "";
		}
	}


	//默认显示all items
	document.getElementsByClassName("radio")[0].click();

	//显示active items count
	RefreshItemsSummary();
}

function RefreshItemsSummary() {
	showActiveItemsCount();
	showCompletedItemsCount();
	refreshFilteredItems();
}

function DeleteItems(_state) {
	todoItemCollection.deleteItemsByState(_state);
	RefreshItemsSummary();
}

function refreshFilteredItems() {
	var filters = document.getElementsByClassName("radio");
	for (var i = 0; i < filters.length; i++) {
		if (filters[i].checked) {
			filters[i].click();
		}
	}
}

function showActiveItemsCount() {
	document.getElementById("activeItemsCount").getElementsByTagName("span")[0].innerText = todoItemCollection.getItemsCountByState(TodoItem.ACTIVE);
}

function showCompletedItemsCount() {
	var btnClearCompletedItems = document.getElementById("btnClearCompletedItems");
	var count = todoItemCollection.getItemsCountByState(TodoItem.COMPLETED);
	btnClearCompletedItems.getElementsByTagName("span")[0].innerText = count;
	if (count < 1) {
		btnClearCompletedItems.setAttribute("style", "display:none;");
	} else {
		btnClearCompletedItems.setAttribute("style", "display:inline;");
	}
}

function TodoItemCollection(ulID) {
	this.todoItems = new Array();
	this.itemAppearanceSetting = new ItemAppearanceSetting("✔", "×", "toggle-state-widget-before-selected", "toggle-state-widget-selected");
	this.ulNode = document.getElementById(ulID);
}

TodoItemCollection.prototype.addItem = function(text, state) {
	var toDoItem = new TodoItem(text, state, this.itemAppearanceSetting, this.refreshItemsSummaryFunction, this.DeleteItemsFunction);
	this.todoItems.push(toDoItem);
	var allLi = this.ulNode.getElementsByTagName("li");
	if (allLi.length > 0) {
		this.ulNode.insertBefore(toDoItem.liNode, allLi[0]);
	} else {
		this.ulNode.insertBefore(toDoItem.liNode, null);
	}

}

TodoItemCollection.prototype.deleteItemsByState = function(state) {
	for (var i = 0; i < this.todoItems.length; i++) {
		var item = this.todoItems[i];
		if (item.state === state || !state) {
			this.ulNode.removeChild(item.liNode);
			this.todoItems.splice(i, 1);
			i--;
		}
	}

}

TodoItemCollection.prototype.changeAllItemsStateTo = function(_state) {
	for (var i = 0; i < this.todoItems.length; i++) {
		var item = this.todoItems[i];
		switch (_state) {
			case TodoItem.ACTIVE:
				item.activate();
				break;
			case TodoItem.COMPLETED:
				item.complete();
				break;
			case TodoItem.DELETED:
				item.delete();
				break;
		}
	}

}

TodoItemCollection.prototype.getItemsCountByState = function(_state) {
	var count = 0;
	for (var i = 0; i < this.todoItems.length; i++) {
		var item = this.todoItems[i];
		if (item.state === _state) {
			count++;
		}
	}
	return count;
}

TodoItemCollection.prototype.showItemsByState = function(_state) {
	for (var i = 0; i < this.todoItems.length; i++) {
		var item = this.todoItems[i];
		if (_state) {
			if (item.state === _state) {
				item.setVisibility(true);
			} else {
				item.setVisibility(false);
			}
		} else {
			item.setVisibility(true);
		}
	}
}

function TodoItem(text, state, itemAppearanceSetting, refreshItemsSummaryFunction, deleteItemsFunction) {
	this.text = text;
	this.state = state;
	this.itemAppearanceSetting = itemAppearanceSetting;
	this.liNode = getTodoItemLiNode(this.text, this.itemAppearanceSetting);
	//this.refreshItemsSummaryFunction = refreshItemsSummaryFunction;
	//this.deleteItemsFunction=deleteItemsFunction;
	var _that = this;
	var _lbToggle = this.liNode.getElementsByTagName("label")[0];
	var _lbItemContent = this.liNode.getElementsByTagName("label")[1];
	var _btnDestroy = this.liNode.getElementsByTagName("button")[0];
	var _txtEdit = this.liNode.getElementsByTagName("input")[0];
	/*给每行前面的状态切换标签绑定事件*/
	(function(that, lbToggle) {
		lbToggle.onclick = function() {
			if (that.state === TodoItem.ACTIVE) {
				that.complete();
			} else if (that.state === TodoItem.COMPLETED) {
				that.activate();
			}

			if (refreshItemsSummaryFunction != null) {
				refreshItemsSummaryFunction();
			}
		}
	})(_that, _lbToggle);
	/*给每行显示item内容的label绑定双击事件*/
	(function(that) {
		_lbItemContent.ondblclick = function() {
			this.setAttribute("style", "display:none");
			_lbToggle.setAttribute("style", "display:none");
			_btnDestroy.setAttribute("style", "display:none");
			_txtEdit.setAttribute("style", "display:block");
			_txtEdit.value = this.innerText;
			_txtEdit.focus();
		}
	})(_that);
	/*给每行的编辑框绑定失去焦点事件*/
	(function() {
		_txtEdit.onblur = function() {
			this.setAttribute("style", "display:none");
			_lbToggle.setAttribute("style", "display:inline");
			_btnDestroy.setAttribute("style", "display:inline");
			_lbItemContent.setAttribute("style", "display:block");
			if (this.value != "") {
				_lbItemContent.innerText = this.value;
			}
		}
	})();
	/*给每行的编辑框绑定键盘事件，按回车时失去焦点*/
	(function() {
		_txtEdit.onkeydown = function(event) {
			var e=event||window.event;
			if(e.keyCode==13){
				this.blur();
			}
		}
	})();
	/*给每行后面的删除按钮绑定事件*/
	(function(that, btnDestroy) {
		btnDestroy.onclick = function() {
			that.delete();
			if (deleteItemsFunction != null) {
				deleteItemsFunction(TodoItem.DELETED);
			}
		}
	})(_that, _btnDestroy);
	/*根据传入的参数初始化状态*/
	(function(that) {
		if (that.state === TodoItem.ACTIVE) {
			that.activate();;
		} else if (that.state === TodoItem.COMPLETED) {
			that.complete();
		}
	})(_that);
}
TodoItem.ACTIVE = "active";
TodoItem.COMPLETED = "completed";
TodoItem.DELETED = "deleted";

function getTodoItemLiNode(text, itemAppearanceSetting) {
	var li = document.createElement("li");
	li.className = itemAppearanceSetting.beforeSelectedClassName;
	var lbToggle = document.createElement("label");
	lbToggle.innerText = itemAppearanceSetting.toggleAppearance;
	var lbTodoContent = document.createElement("label");
	lbTodoContent.innerText = text;
	var txtEdit = document.createElement("input");
	txtEdit.type = "text";
	var btnDestroy = document.createElement("button");
	btnDestroy.innerText = itemAppearanceSetting.destroyAppearance;
	li.appendChild(lbToggle);
	li.appendChild(lbTodoContent);
	li.appendChild(txtEdit);
	li.appendChild(btnDestroy);
	return li;
}

TodoItem.prototype.activate = function() {
	this.state = TodoItem.ACTIVE;
	this.liNode.className = this.itemAppearanceSetting.beforeSelectedClassName;
}

TodoItem.prototype.complete = function() {
	this.state = TodoItem.COMPLETED;
	this.liNode.className = this.itemAppearanceSetting.selectedClassName;
}

TodoItem.prototype.delete = function() {
	this.state = TodoItem.DELETED;
}

TodoItem.prototype.setVisibility = function(visible) {
	if (!visible) {
		this.liNode.setAttribute("style", "display:none");
	} else {
		this.liNode.setAttribute("style", "display:block");
	}
}


function ItemAppearanceSetting(toggleAppearance, destroyAppearance, beforeSelectedClassName, selectedClassName) {
	this.toggleAppearance = toggleAppearance;
	this.destroyAppearance = destroyAppearance;
	this.beforeSelectedClassName = beforeSelectedClassName;
	this.selectedClassName = selectedClassName;
}