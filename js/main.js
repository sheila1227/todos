var todoItemCollection;
window.onload=function(){
	todoItemCollection=new TodoItemCollection("notes");
	todoItemCollection.addItem("HHHHHHH","ACTIVE");
}

function TodoItemCollection(ulID){
	this.todoItems=new Array();
	this.itemAppearanceSetting=new ItemAppearanceSetting("todo-item-outer","todo-item-inner","toggle-item-state");
	this.ulNode=document.getElementById(ulID);
}

TodoItemCollection.prototype.addItem=function(text,state){
	var toDoItem=new TodoItem(text,state,this.itemAppearanceSetting);
	this.ulNode.appendChild(toDoItem.liNode);
}

TodoItemCollection.prototype.removeItem=function(){
	
}

TodoItemCollection.prototype.removeAllItems=function(){
	
}

function TodoItem(text,state,itemAppearanceSetting){
	this.text=text;
	this.state=state;
	this.itemAppearanceSetting=itemAppearanceSetting;
	this.liNode=getTodoItemLiNode(this.text,this.itemAppearanceSetting);
	this.liNode.firstChild.click=function(){
		alert("jkj");
	}

}

function getTodoItemLiNode(text,itemAppearanceSetting){
		var li=document.createElement("li");
		var checkBox=document.createElement("input");
		checkBox.type="checkBox";
		checkBox.className=itemAppearanceSetting.checkboxClassName;
		var outerDiv=document.createElement("div");
		var innerDiv=document.createElement("div");
		outerDiv.className=itemAppearanceSetting.outerDivClassName;
		innerDiv.className=itemAppearanceSetting.innerDivClassName;
		innerDiv.innerHTML=text;
		outerDiv.appendChild(innerDiv);
		li.appendChild(checkBox);
		li.appendChild(outerDiv);
		return li;
}

TodoItem.prototype.activate=function(){

}

TodoItem.prototype.complete=function(){

}

TodoItem.prototype.delete=function(){

}

function ItemAppearanceSetting(outerDivClassName,innerDivClassName,checkboxClassName){
	this.outerDivClassName=outerDivClassName;
	this.innerDivClassName=innerDivClassName;
	this.checkboxClassName=checkboxClassName;
}

