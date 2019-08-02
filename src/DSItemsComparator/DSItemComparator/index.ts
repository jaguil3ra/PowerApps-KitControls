import {IInputs, IOutputs} from "./generated/ManifestTypes";
import DataSetInterfaces = ComponentFramework.PropertyHelper.DataSetApi;
type DataSet = ComponentFramework.PropertyTypes.DataSet;
import * as ko from 'knockout';
import { Chart } from 'chart.js'
import { string } from "prop-types";

enum ActionStatus{
	Back,
	Init,
	Next
}
interface IPageParameters {
	page:string,
	compare:string,
	element:string,
	picture:string,
	empty:string
}
interface IPageHelper extends DataSetInterfaces.Paging{
	pageSize?:number;
}
class ComponentVM {
	//language labels for ui - ENGLISH
	private pageParameters1033:IPageParameters ={
		page:"Page",
		compare:"Compare",
		element:"Elements Selected: ",
		picture:"Picture",
		empty:"No data available."
	}
	//language labels for ui - SPANISH
	private pageParameters3082:IPageParameters ={
		page:"Pagina",
		compare:"Comparar",
		element:"Elementos Seleccionados: ",
		picture:"Imagen",
		empty:"No hay información disponible"
	}

	public hasPicture:KnockoutObservable<boolean>
	public productElements:KnockoutObservableArray<ProductRowVM>	
	public itemsColumn:KnockoutObservableArray<string>	
	public chartLabels: KnockoutObservableArray<string>	
	public elementsToChart: KnockoutObservableArray<IProductData>	
	public pageNumber : KnockoutObservable<number>
	public from : KnockoutObservable<number>
	public to : KnockoutObservable<number>
	public totalRecords : KnockoutObservable<number>
	public enableNext : KnockoutObservable<boolean>
	public enablePrevious: KnockoutObservable<boolean>
	public pageParameters: KnockoutObservable<IPageParameters>
	public getTotalSelectedItems : KnockoutObservable<number>

	private _internalGoToElementView:(itemId:string)=>void;
	private _internalOpenPop:()=>void;
	private _internalLoadNextData:()=>void;
	private _internalLoadPreviousData:()=>void;
	private _internalSelectedOrCleanItems:()=>void;
	private _internalGoToFirstPage:()=>void;

	constructor(openPop:()=>void,loadNextData:()=>void,loadPreviousData:()=>void,selectedOrCleanItems:()=>void,goToFirstPage:()=>void, goToElementView:(itemId:string)=>void){
		
		this.selectItem = this.selectItem.bind(this);
		this.goToElementView = this.goToElementView.bind(this);


		this._internalOpenPop=openPop;
		this._internalLoadNextData=loadNextData;
		this._internalLoadPreviousData = loadPreviousData;
		this._internalSelectedOrCleanItems = selectedOrCleanItems;
		this._internalGoToElementView = goToElementView;	
		this._internalGoToFirstPage = goToFirstPage;

		this.getTotalSelectedItems=ko.observable(0),
		this.totalRecords=ko.observable(0),
		this.pageNumber = ko.observable(1);
		this.from = ko.observable(0);
		this.to = ko.observable(0);
		this.elementsToChart = ko.observableArray(Array<any>());
		this.chartLabels = ko.observableArray(Array<string>());
		this.productElements = ko.observableArray(Array<ProductRowVM>());
		this.itemsColumn = ko.observableArray(Array<string>());
		this.enableNext = ko.observable(false);
		this.hasPicture = ko.observable(false);
		this.enablePrevious = ko.observable(false);
		this.pageParameters = ko.observable(this.pageParameters1033);
	}

	public goToFistPage(){
		this._internalGoToFirstPage();
	}

	public setLanguage(languageId:number){
		if(languageId == 3082){
			this.pageParameters(this.pageParameters3082);
		}
	}
	
	public goToElementView(item:ProductRowVM){
		//Open the Record in the native form
		this._internalGoToElementView(item.id())
	}

	public openPop():void{
		this._internalOpenPop();
	}
	public selectItem(item:ProductRowVM):void{
		item.isSelected(!item.isSelected());
		this._internalSelectedOrCleanItems();
		this.getTotalSelectedItems(this.productElements().filter(p => p.isSelected()).length);
	}
	public loadNextData():void{
		this._internalLoadNextData();
	}
	public loadPreviousData():void{
		this._internalLoadPreviousData();
	}
}
class ProductRowVM{
	public img:KnockoutObservable<string>
	public id: KnockoutObservable<string>
	public properties :KnockoutObservableArray<IProductProperty>
	public isSelected:KnockoutObservable<boolean>
	constructor(){
		this.img = ko.observable("");
		this.id = ko.observable("");
		this.isSelected = ko.observable(false);
		this.properties = ko.observableArray(Array<IProductProperty>());
	}
}
interface IProductData {
	label:string,
	backgroundColor:string,
	pointBorderColor:string,
	data:Array<Number>
}
interface IProductProperty {
	alias?:string,
	displayName:string,
	value:Number|Date|string,
	type:string
}

interface PopOptions extends ComponentFramework.FactoryApi.Popup.Popup{
	popupStyle: {
	}
}
export class DSItemComparator implements ComponentFramework.StandardControl<IInputs, IOutputs> {
	private readonly _backgroundColors:Array<string> = new Array<string>("#edc9514d","#cc333f61","#00a0b061","#024f8c9c","#673ab79e","#8bc34aad","#9e9e9eb8","#795548a6")

	private readonly _borderColors:Array<string> = new Array<string>("#EDC951","#CC333F","#00A0B0","#024f8c","#673ab7","#8bc34a","#9e9e9e","#795548")

	private _chartType:string;
	//Body template for grid, it is binding with knockout
	private readonly _bodyTemplate:string =`
								<div class="main-flex">
									<div class="fixed-top">
										<button data-bind="click:openPop, enable:getTotalSelectedItems()>0" class="buttonComparator" ><span class='icon icon-crop'> <span data-bind="text:pageParameters().compare"></span></button>
										<label data-bind="text:pageParameters().element+' '+getTotalSelectedItems()"></label>
									</div>
									<div class="table-container">
										<table>
											<thead>
												<tr data-bind='foreach:itemsColumn'>
													<th data-bind="text:$data"></th>
												</tr>
											</thead>
											<tbody >
												<!--ko foreach:productElements -->
												<tr>
													<td data-bind="click:$root.selectItem"><button data-bind="css:isSelected() ?'icon icon-checkmark checkedbutton':'icon icon-checkbox-unchecked uncheckedbutton'" ></button></td>
													<!-- ko if:$root.hasPicture() -->
													<td data-bind='click:$root.goToElementView'>
													<img data-bind="attr: {src: img }" class="picture" onerror="this.onerror=null; this.src=''; this.className='defaulPicture'" />
													</td>
													<!-- /ko -->
													<!--ko foreach:properties -->
													<td data-bind="event: { dblclick: ()=>{$root.goToElementView($parent)}  }">
														<!--ko if:$index()!= 0-->
														<span data-bind='text:value'></span>	
														<!-- /ko -->
														<!--ko if:$index()== 0-->
														<a href="#" data-bind='text:value,click: ()=>{$root.goToElementView($parent)}'></a>
														<!-- /ko -->
													</td>
													<!--/ko -->															
												</tr>
												<!-- /ko -->																																													
												<!-- ko if:productElements().length == 0-->
												<tr >
													<td style="text-align:center" data-bind="attr:{ colspan: itemsColumn().length}"><span data-bind="text:pageParameters().empty"></span></td>
												</tr>
												<!-- /ko -->
											</tbody>
										</table>
									</div>
									<div class="fixed-bottom" data-bind="visible:productElements().length > 0">
										<div class='flex-item-3 row-quantity'>
											<br />
											<span data-bind="text:from"></span> - 
											<span data-bind="text:to"></span> of <span data-bind="text:totalRecords"></span>
										</div>
										<div class='pagination flex-item-7'>
											<br />
											<button class="paginationButtons" data-bind="click:goToFistPage, enable:pageNumber()>1"><span class="icon icon-first"></span></button>
											<button class="paginationButtons" data-bind="click:loadPreviousData, enable:enablePrevious" style="margin-left: 20px"><span class="icon icon-arrow-left2"></span></button>
											<span class="page" data-bind="text: $root.pageParameters().page+' '+ pageNumber()"></span>
											<button class="paginationButtons" data-bind="click:loadNextData,enable:enableNext " margin-left:10px><span class="icon icon-arrow-right2"></span></button>
										</div>												
									</div>
								</div>
											`;
	//save all current items guid
	private currentIds = Array<string>();

	//Index number for records. for default is zero (example: record from 0 to 25)
	private currenctIndex = 0;
	// quantity of the records for pages in the ui. For default is 25 but is change with the user configuration
	private pageSize = 25;

	//define the action that is done. Init is when load firts time
	private currenctAction:ActionStatus = ActionStatus.Init;

	//chart object
	private _chart:Chart;

	//Knockout component. Let binding actions with the ui
	public componentVM:ComponentVM;

	private _context:ComponentFramework.Context<IInputs>

	private _popContainer : HTMLDivElement;

	private mainContainer: HTMLDivElement;

	private _popService: ComponentFramework.FactoryApi.Popup.PopupService;

	/**
	 * Empty constructor.
	 */
	constructor()
	{
		// pass the method as parameters to componentVM
		this.componentVM = new ComponentVM(
			this.openChartPop.bind(this),
			this.loadNextData.bind(this),
			this.loadPreviousData.bind(this),
			this.selectedOrCleanItem.bind(this),
			this.goToFirstPage.bind(this),
			this.goToItemView.bind(this),
		); 
	}

	/**
	 * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
	 * Data-set values are not initialized here, use updateView.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
	 * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
	 * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
	 * @param container If a control is marked control-type='starndard', it will receive an empty div element within which it can render its content.
	 */
	public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container:HTMLDivElement)
	{
		
		this._context = context;
		this.componentVM.hasPicture(this._context.parameters.imgNameproperty!.raw == "YES");
		this.componentVM.setLanguage(this._context.userSettings.languageId);
		this.mainContainer = document.createElement("div");
		this.mainContainer.setAttribute("class","flex-element")
		this._popContainer = document.createElement("div");
		let closeButton = document.createElement("button");
		closeButton.innerHTML="&times;";
		closeButton.setAttribute("class","closeModal");
		closeButton.addEventListener("click",this.closeChartPop.bind(this))


		let chartContainer = document.createElement("div");
		
		chartContainer.setAttribute("class","modalContainer");
		chartContainer.appendChild(closeButton);



		let canvas = document.createElement("canvas");
		canvas.setAttribute("id","marksChart")

		chartContainer.appendChild(canvas)

		this._popContainer.appendChild(chartContainer)
		this.mainContainer.innerHTML = this._bodyTemplate;
		
		container.appendChild(this.mainContainer)
		container.appendChild(this._popContainer)
		this._popService = this._context.factory.getPopupService();
		const popUpOptions: PopOptions = {
			closeOnOutsideClick: false,
			content: this._popContainer,
			name: "popChart",
			type: 1,
			popupStyle: {
				display:"flex",
				justifyContent: "center",
				alignItems: "center",
				overflowX:"hidden",
				overflowY:"auto",
				height:"100%",
				margin:"0 auto",
				paddin:"20px",
				bottom:"0px",
				top:"0px",
				width:"100%",
				minWidth:"500px",
				//backgroundColor: "rgb(255, 255, 255)",
				//boxShadow: "rgb(0, 0, 0) 0px 25.6px 57.6px 0px, rgb(0, 0, 0) 0px 4.8px 14.4px 0px"
			}
		}
		this._popService.createPopup(popUpOptions);
		
		ko.applyBindings(this.componentVM, this.mainContainer);
	}

	/**
	 * 
	 * @param itemId 
	 */
	public goToItemView(itemId:string){
		//Open the Record in the native form
		let entityReference = this._context.parameters.itemsDataSet.records[itemId].getNamedReference();
		let entityFormOptions = {
			entityName: entityReference.entityType!,
			entityId: entityReference.id,
		}
		this._context.navigation.openForm(entityFormOptions);
	}

	public goToFirstPage(){
		this.currenctAction = ActionStatus.Init;
		this.componentVM.pageNumber(1);
		this.componentVM.getTotalSelectedItems(0);
		this.setGrid(this._context.parameters.itemsDataSet,true);
	}


	public loadNextData(){
		if((this.currenctIndex+this.pageSize) >= this.componentVM.totalRecords())
			return;
		this.componentVM.getTotalSelectedItems(0);
		this.currenctAction = ActionStatus.Next;
		if(this._context.parameters.itemsDataSet.paging.hasNextPage){
			this._context.parameters.itemsDataSet.paging.loadNextPage();
		}else{
			this.setGrid(this._context.parameters.itemsDataSet,true);
		}
		this.componentVM.pageNumber(this.componentVM.pageNumber()+1);
	}

	public loadPreviousData(){
		if(this.currenctIndex < this.pageSize){
			return;
		}
		this.componentVM.getTotalSelectedItems(0);
		this.currenctAction = ActionStatus.Back;
		this.componentVM.pageNumber(this.componentVM.pageNumber()-1);	
		this.setGrid(this._context.parameters.itemsDataSet,true);	
	}

	public selectedOrCleanItem(){
		let ids = this.componentVM.productElements().filter(p=> p.isSelected()).map((p)=>{ return p.id() });
		this._context.parameters.itemsDataSet.setSelectedRecordIds(ids);
	}

	/**
	 * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
	 */
	public updateView(context: ComponentFramework.Context<IInputs>): void
	{
		this._chartType = this._context.parameters.chartType.raw;
		this._context = context;	
		let pageHelper:IPageHelper = this._context.parameters.itemsDataSet.paging;
		this.pageSize = pageHelper.pageSize? pageHelper.pageSize: this.pageSize;
		this.componentVM.totalRecords(this._context.parameters.itemsDataSet.paging.totalResultCount);
		if(!this._context.parameters.itemsDataSet.loading){
			this.setGrid(this._context.parameters.itemsDataSet);
			this.componentVM.totalRecords(this._context.parameters.itemsDataSet.paging.totalResultCount)
		}
	}


	private setGrid(dataset: ComponentFramework.PropertyTypes.DataSet, updateView:boolean=false):void 
	{
		if(JSON.stringify(this._context.parameters.itemsDataSet.sortedRecordIds) == JSON.stringify(this.currentIds) && !updateView){
			return;
		}
		let totalRecords = this.componentVM.totalRecords();


		this.currentIds = dataset.sortedRecordIds;
		let allProductRow = new Array<ProductRowVM>();
		let allColumns = Array<string>();
		
		//check if column names is fill
		let fillColumns = this.componentVM.itemsColumn.length == 0
		//if empty so fill
		if(fillColumns){
			allColumns.push("");
			//If imgNameProperty is TRUE so enable column picture
			if(this._context.parameters.imgNameproperty!.raw == "YES")
				allColumns.push(this._context.userSettings.languageId == 3082 ? "Imagen" :"Picture");
		}


		let toIndex:number=0;
		//If user click in back so current index - pageSize
		if(this.currenctAction == ActionStatus.Back){
			toIndex = this.currenctIndex;
			this.currenctIndex -= this.pageSize;
		//if user click next so current index + pageSize	
		}else if(this.currenctAction == ActionStatus.Next){
			this.currenctIndex+= this.pageSize;
			toIndex = this.currenctIndex+ this.pageSize;
		//default page is 1
		}else{
			this.currenctIndex = 0;
			toIndex =  this.pageSize;
		}

		this.componentVM.from(this.currenctIndex+1)
		this.componentVM.to(toIndex> totalRecords?totalRecords:toIndex);	
		this.componentVM.enableNext( (this.currenctIndex+this.pageSize) < this.componentVM.totalRecords())
		this.componentVM.enablePrevious(this.currenctIndex >= this.pageSize);
		dataset.sortedRecordIds.slice(this.currenctIndex,toIndex).forEach((recordId,index)=>{			
			let productItem = new ProductRowVM();
			productItem.id(recordId);
			if(this._context.parameters.imgNameproperty!){
				let entityReference = this._context.parameters.itemsDataSet.records[recordId].getNamedReference();
				let imgUrl = "/Image/download.aspx?Entity="+entityReference.entityType!+"&Attribute=entityimage&Id="+entityReference.id!
				productItem.img(imgUrl);
			}

			let item = dataset.records[recordId];
			dataset.columns.forEach( (column) => {
				if(fillColumns){
					allColumns.push(column.displayName)
				}
				let productProperty:IProductProperty ={
					alias: column.alias,
					displayName : column.displayName,
					value : item.getFormattedValue(column.name),
					type : column.dataType
				};		
				productItem.properties.push(productProperty)
			})
			fillColumns=false;
			allProductRow.push(productItem);
			
		})
		this.componentVM.productElements(allProductRow);		
		this.componentVM.itemsColumn(allColumns);
	}

	public closeChartPop():void{
		this._chart.destroy();
		this._popService.closePopup("popChart");
	}

	public openChartPop():void{
		this._popService.openPopup("popChart");
		let selectedItems = this.componentVM.productElements().filter(p => p.isSelected())
		let marksCanvas = document.getElementById("marksChart") as HTMLCanvasElement;
		let marksData = {
			labels : this.componentVM.chartLabels(),
			datasets: this.setValuesToChart(selectedItems),
		}
		this._chart = new Chart(marksCanvas, {
			type: this._chartType,
			data: (marksData as any),
			options:{
				legend:{
					labels:{
						fontSize:20
					}					
				},
				tooltips: {
					enabled: true,
					callbacks: {
						label: function(tooltipItem, data) {
							return data.datasets![tooltipItem.datasetIndex!].label + ' : ' + data.datasets![tooltipItem.datasetIndex!].data![tooltipItem.index!];
						}
					}
				}		
			}
		});
	}


	private setValuesToChart(items:Array<ProductRowVM>):Array<IProductData>{
		let allRecords = Array<IProductData>();
		let fillLabels = this.componentVM.chartLabels().length == 0;
		
		items.forEach( (item,index) =>{
			let productChartData:IProductData = {
				label:"",
				backgroundColor:this._backgroundColors.length > index ? this._backgroundColors[index]:"",
				pointBorderColor:this._borderColors.length > index ? this._borderColors[index]:"",
				data:Array<Number>()				
			}
			item.properties().forEach(element=>{
				switch (element.alias) {
					case 'titlePropertySet':
						productChartData.label = element.value.toString();
					break;
					case 'number1PropertySet':
						productChartData.data.push(element.value as number); 
						if(fillLabels && !this.componentVM.chartLabels().find(p=> p == element.displayName))
							this.componentVM.chartLabels.push(element.displayName);
						break;
					case 'number2PropertySet':
						productChartData.data.push(element.value as number); 
						if(fillLabels && !this.componentVM.chartLabels().find(p=> p == element.displayName))
							this.componentVM.chartLabels.push(element.displayName);
						break;	
					case 'number3PropertySet':
						productChartData.data.push(element.value as number); 
						if(fillLabels && !this.componentVM.chartLabels().find(p=> p == element.displayName))
							this.componentVM.chartLabels.push(element.displayName);
						break;	
					case 'number4PropertySet':
						productChartData.data.push(element.value as number); 
						if(fillLabels && !this.componentVM.chartLabels().find(p=> p == element.displayName))
							this.componentVM.chartLabels.push(element.displayName);
						break;	
					case 'number5PropertySet':
						productChartData.data.push(element.value as number); 
						if(fillLabels && !this.componentVM.chartLabels().find(p=> p == element.displayName))
							this.componentVM.chartLabels.push(element.displayName);
						break;	
					case 'number6PropertySet':
						productChartData.data.push(element.value as number); 
						if(fillLabels && !this.componentVM.chartLabels().find(p=> p == element.displayName))
							this.componentVM.chartLabels.push(element.displayName);
						break;	
					case 'number7PropertySet':
						productChartData.data.push(element.value as number); 
						if(fillLabels && !this.componentVM.chartLabels().find(p=> p == element.displayName))
							this.componentVM.chartLabels.push(element.displayName);
						break;
					case 'number8PropertySet':
						productChartData.data.push(element.value as number); 
						if(fillLabels && !this.componentVM.chartLabels().find(p=> p == element.displayName))
							this.componentVM.chartLabels.push(element.displayName);
						break;																																												
					default:
						break;
				}
			})
			allRecords.push(productChartData);
		})
		return allRecords;
	}

	/** 
	 * It is called by the framework prior to a control receiving new data. 
	 * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
	 */
	public getOutputs(): IOutputs
	{
		return {};
	}

	/** 
	 * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
	 * i.e. cancelling any pending remote calls, removing listeners, etc.
	 */
	public destroy(): void
	{
		// Add code to cleanup control if necessary
	}

}