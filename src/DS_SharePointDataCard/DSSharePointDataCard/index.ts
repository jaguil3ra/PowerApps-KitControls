import {IInputs, IOutputs} from "./generated/ManifestTypes";
import DataSetInterfaces = ComponentFramework.PropertyHelper.DataSetApi;
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App, { IAppProperties }  from './app';
import IRecordInformation from './IRecordInformation';


type DataSet = ComponentFramework.PropertyTypes.DataSet;

export class DSSharePointDataCard implements ComponentFramework.StandardControl<IInputs, IOutputs> {
	private _context:ComponentFramework.Context<IInputs>;
	private _container:HTMLDivElement;
	private _allRecord=Array<IRecordInformation>()


	/**
	 * Empty constructor.
	 */
	constructor()
	{

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
		this._container = container;
	}


	/**
	 * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
	 */
	public updateView(context: ComponentFramework.Context<IInputs>): void
	{
		this._context = context;
		let dataset = context.parameters.sampleDataSet;
		this.recordsDecorator(dataset);
		dataset.setSelectedRecordIds([]);
		ReactDOM.render(
			React.createElement(
				App,
				{ 
					elements: this._allRecord,
					enableLoadMore : this._context.parameters.sampleDataSet.paging.hasNextPage,
					loadNextRecords: this.loadNextRecords.bind(this),
					setSelectedRecord: this.notififySelectedRecords.bind(this)
				}
			),
			this._container
		);
	}

	private notififySelectedRecords(recordId:string)
	{
		let currentRecord = this._allRecord.find(p => p.id == recordId)!;
		currentRecord.selected = !currentRecord.selected
		this._context.parameters.sampleDataSet.setSelectedRecordIds(this._allRecord.filter(p => p.selected).map( p=> { return p.id}));
	}


	private loadNextRecords(){
		this._context.parameters.sampleDataSet.paging.loadNextPage();
	}

	private recordsDecorator(dataset: DataSet)
	{
		let currentdIds = dataset.sortedRecordIds;
		let tempAllRecord = Array<IRecordInformation>()

		currentdIds.forEach(id => {
			let element = dataset.records[id];
			
			//defined the columns
			let columnAbsoluteUrl = dataset.columns.find(p => p.alias == "urlAbsolute");
			let columnUser = dataset.columns.find(p => p.alias == "author");
			let columnDocumentName = dataset.columns.find(p => p.alias == "documentName");
			let columnDate = dataset.columns.find(p => p.alias == "created");

			//Get path
			let absolutePath = element.getValue(columnAbsoluteUrl!.name).toString();
			let relativePath ="";
			let siteName = "";
			let siteUrl = "";

			//Check if is sharepoint site
			if(absolutePath.indexOf("/sites/") != -1){
				relativePath = absolutePath.substring(0,absolutePath.indexOf("/sites/")+7);
				let tempPath = absolutePath.substring(absolutePath.indexOf("/sites/")+7);
				siteName = tempPath.substring(0, tempPath.indexOf('/'));
				siteUrl  = relativePath+siteName;
			//Check if is sharepoint site with teams path
			}else if(absolutePath.indexOf("/teams/") != -1){
				relativePath = absolutePath.substring(0,absolutePath.indexOf("/teams/")+7);
				let tempPath = absolutePath.substring(absolutePath.indexOf("/teams/")+7);
				siteName = tempPath.substring(0, tempPath.indexOf('/'));
				siteUrl  = relativePath+siteName;				
			}
			//Check if is onedrive site
			else if(absolutePath.indexOf("my.sharepoint.com/personal/") != -1){
				relativePath = absolutePath.substring(0,absolutePath.indexOf("my.sharepoint.com/personal/")+27);
				let tempPath = absolutePath.substring(absolutePath.indexOf("my.sharepoint.com/personal/")+27);
				siteName = tempPath.substring(0, tempPath.indexOf('/'));
				siteUrl  = relativePath+siteName;
			//Main site
			}
			else{
				siteUrl = absolutePath.substring(0,absolutePath.indexOf(".sharepoint.com/")+16);
			}


			let user = element.getFormattedValue(columnUser!.name);
			let date = element.getFormattedValue(columnDate!.name);			
			let ext = element.getFormattedValue(columnDocumentName!.name).toString().split(".").pop();
			let selectedRecordIds = dataset.getSelectedRecordIds();
			/*
			let isSelected = false;
			if(selectedRecordIds != undefined){
				isSelected = dataset.getSelectedRecordIds().find(p => p == id) != undefined;
			}
			*/
			let isCheckOut = (element.getValue("ischeckedout") as number) == 1;
			let record:IRecordInformation= {
				id:id,
				name: element.getFormattedValue(columnDocumentName!.name).toString(),
				absoluteUrl: absolutePath,
				siteUrl: siteUrl,
				date:date,
				user:user,
				ext:ext+".png",
				selected:false,
				isCheckOut				
			}

			tempAllRecord.push(record);

		})
		this._allRecord = tempAllRecord;
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