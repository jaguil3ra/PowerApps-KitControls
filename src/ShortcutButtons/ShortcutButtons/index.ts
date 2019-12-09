import {IInputs, IOutputs} from "./generated/ManifestTypes";
import * as ReactDOM from 'react-dom';
import * as React from 'react';
import App from './app';
import IButtonProperty from './IButtonProperty';




export class ShortcutButtons implements ComponentFramework.StandardControl<IInputs, IOutputs> {
	private _container:HTMLDivElement;
	private _context:ComponentFramework.Context<IInputs>;
	private _entity:string;
	private _recordId:string;
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
		this._container = container;
		this._context = context;
		this.setFormData();
		this.renderComponent(context);
	}


	private setFormData(){

		if(["Mobile","Outlook"].indexOf(this._context.client.getClient()) != -1){
			//@ts-ignore
			let entityRef = Xrm.Page._entityReference;
			if(entityRef.id == 	undefined) return;

			this._entity = entityRef.etn;
			this._recordId  = entityRef.id.guid;
			return;
		}
		var queryString = window.location.search.slice(1);
		var arr = queryString.split('&');
		let parameters: { [id:string] : string} = {

		};
		arr.forEach((element)=>{
			let keyvalue = element.split("=");
			parameters[keyvalue[0]] = keyvalue[1];
		})



		this._entity=parameters["etn"];
		this._recordId  = parameters["id"];
	}
	public updateView(context: ComponentFramework.Context<IInputs>): void
	{
		this._context = context;
		this.setFormData();
		this.renderComponent(context);
	}

	public openForm(entity:string, isQuickForm?:boolean){
		let entityReference ={
			id: this._recordId,
			entityType: this._entity,
			name:this._context.parameters.Name.raw,
		}		

		let entityFormOptions = {	
			createFromEntity:entityReference,		
			entityName: entity,
			useQuickCreateForm:isQuickForm			
		}

		//@ts-ignore
		//console.log(Xrm.Utility);
		this._context.navigation.openForm(entityFormOptions).then((response)=>{
			console.log(response);
		});
	}

	private renderComponent(context: ComponentFramework.Context<IInputs>){

		let buttonsProperies = Array<IButtonProperty>();
		//Samples JSON:
		//{"entity":"contact","quickForm":true,"title":"Add Contact","background":"#4caf50","icon":"ContactInfo", "description":"Add a new contact to account"}
		//{"entity":"account","quickForm":true,"title":"Add Credit","background":"#673ab7","icon":"PaymentCard", "description":"Add a new credit to account"}
		//{"entity":"incident","quickForm":false,"title":"Create Case","background":"#e91e63","icon":"Headset", "description":"Create a new case to account"}
		//{"entity":"task","quickForm":true,"title":"Task","background":"#3c7739","icon":"TaskLogo", "description":"Create a new task"}
		//{"entity":"email","quickForm":true,"title":"Email","background":"#0078d4","icon":"Mail", "description":"Create a new email"}
		//{"entity":"appointment","quickForm":true,"title":"Appointment","background":"#636580","icon":"CalendarAgenda", "description":"Create a new appointment"}
		//{"entity":"phonecall","quickForm":true,"title":"Phone Call","background":"#5458af","icon":"Phone", "description":"Create a new phonecall"}
		buttonsProperies.push(this.parsePropertyButtonToJson(context.parameters.buttonNumber1.raw.toString()))

		if(this._context.parameters.buttonNumber2.raw){
			buttonsProperies.push(this.parsePropertyButtonToJson(context.parameters.buttonNumber2.raw.toString()))
		}
		if(this._context.parameters.buttonNumber3.raw){
			buttonsProperies.push(this.parsePropertyButtonToJson(context.parameters.buttonNumber3.raw.toString()))
		}
		if(this._context.parameters.buttonNumber4.raw){
			buttonsProperies.push(this.parsePropertyButtonToJson(context.parameters.buttonNumber4.raw.toString()))
		}			
		let type = context.parameters.buttonType.raw
		let showDescription = context.parameters.showButtonDescription.raw  == "Yes";
		ReactDOM.render(
			React.createElement(
				App,
				{ 
					type, 
					enable: this._recordId != undefined,
					elements: buttonsProperies, 
					buttonSize: context.parameters.buttonSize.raw, 
					openForm: this.openForm.bind(this), 
					showDescription
				}
			),
			this._container
		)
	}

	private  parsePropertyButtonToJson(property:string): IButtonProperty{
		try {
			return JSON.parse(property) as IButtonProperty;
		} catch (error) {
			let button : IButtonProperty ={
				icon:"Picture",
				title:"json error",
				entity:"",
				background:"#e93a1e"
			}
			return button;
		}
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