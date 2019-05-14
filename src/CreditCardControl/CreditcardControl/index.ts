import {IInputs, IOutputs} from "./generated/ManifestTypes";
import { number } from "prop-types";
const Card = require("card");

//Properties for Card plugin
interface ICardOptions{
	form : string | HTMLDivElement,
	container : string | HTMLDivElement,
	placeholders?:{
		number:string,
		name:string,
		expiry:string,
		cvc:string
	},
	width?:number,
	masks?:{
		cardNumber:string,
	}
}

export class CreditCardControl implements ComponentFramework.StandardControl<IInputs, IOutputs> {

	private _valueNumber: string;
	private _valueName: string;
	private _valueCVC: string;
	private _valueExp: string;
	// PCF framework delegate which will be assigned to this object which would be called whenever any update happens. 
	private _notifyOutputChanged: () => void;

	private _container: HTMLDivElement;

	private _context: ComponentFramework.Context<IInputs>;

	private inputNumber:HTMLInputElement
	private inputName:HTMLInputElement
	private inputCVC:HTMLInputElement
	private inputExp:HTMLInputElement
	
	private _refreshDataName: EventListenerOrEventListenerObject;
	private _refreshDataNumber: EventListenerOrEventListenerObject;
	private _refreshDataCVC: EventListenerOrEventListenerObject;
	private _refreshDataExp: EventListenerOrEventListenerObject;

	private _card: any;

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
		this._container = document.createElement("div");
		
		this._notifyOutputChanged = notifyOutputChanged;

		this._refreshDataNumber = this.refreshDataNumber.bind(this)
		this._refreshDataCVC = this.refreshDataCVC.bind(this);
		this._refreshDataExp = this.refreshDataExp.bind(this);
		this._refreshDataName = this.refreshDataName.bind(this);


		//Card Content
		const cardContent = document.createElement("div");
		const form = document.createElement("div");
		
		form.setAttribute("class","credicardForm")

		const row1 = document.createElement("div");
		row1.setAttribute("class","row")
		

		const row2 = document.createElement("div");
		row2.setAttribute("class","row")

		const col1 = document.createElement("div");
		col1.setAttribute("class","column")
		const col2 = document.createElement("div");
		col2.setAttribute("class","column")
		const col3 = document.createElement("div");
		col3.setAttribute("class","column column-6")
		const col4 = document.createElement("div");
		col4.setAttribute("class","column column-6")

		row1.appendChild(col1);
		row1.appendChild(col2);
		row2.appendChild(col3);
		row2.appendChild(col4);

		this.inputNumber = document.createElement("input");
		this.inputNumber.setAttribute("name","number");
		this.inputNumber.setAttribute("type","text");
		this.inputNumber.setAttribute("autocomplete","off");
		this.inputNumber.setAttribute("placeholder","Card number");
		this.inputNumber.addEventListener("input",this._refreshDataNumber);
		col1.appendChild(this.inputNumber);
		

		this.inputName = document.createElement("input");
		this.inputName.setAttribute("name","name");
		this.inputName.setAttribute("placeholder","Full Name");
		this.inputName.setAttribute("autocomplete","off");
		this.inputName.setAttribute("type","text");
		this.inputName.addEventListener("change",this._refreshDataName);
		col2.appendChild(this.inputName);

		this.inputExp = document.createElement("input");
		this.inputExp.setAttribute("name","expiry");
		this.inputExp.setAttribute("placeholder","MM/YY");
		this.inputExp.setAttribute("autocomplete","off");
		this.inputExp.setAttribute("type","text");
		this.inputExp.addEventListener("change",this._refreshDataExp);
		col3.appendChild(this.inputExp);

		this.inputCVC = document.createElement("input");
		this.inputCVC.setAttribute("name","cvc");
		this.inputCVC.setAttribute("placeholder","CVC");
		this.inputCVC.setAttribute("autocomplete","off");
		this.inputCVC.setAttribute("type","text");
		this.inputCVC.addEventListener("change",this._refreshDataCVC);
		col4.appendChild(this.inputCVC);

		form.appendChild(row1);
		form.appendChild(row2);

		this._container.appendChild(cardContent);
		this._container.appendChild(form);
		container.appendChild(this._container);

		
		const cardOptions:ICardOptions ={
			form: form,
			container: cardContent,
			/*
			uncomment if you want mask the card number
			masks: {
				cardNumber: '•' // optional - mask card number
			},
			*/
			placeholders: {
				number: '**** **** **** ****',
				name: 'Full Name',
				expiry: '**/****',
				cvc: '***'
			}
		}
		this._card = new Card(cardOptions);

		//#region trigger manual event for set card values
		let evt = document.createEvent('HTMLEvents');
		if(this._context.parameters.numberProperty.raw){
			this.inputNumber.value = this._context.parameters.numberProperty.raw;
			evt.initEvent('keyup', false, true);
			this.inputNumber.dispatchEvent(evt);
		}
		if(this._context.parameters.nameProperty.raw){
			this.inputName.value = this._context.parameters.nameProperty.raw;
			evt.initEvent('change', true, true);
			this.inputName.dispatchEvent(evt);
		}
		if(this._context.parameters.cvcProperty.raw){
			this.inputCVC.value = this._context.parameters.cvcProperty.raw;
			evt.initEvent('change', true, true);
			this.inputCVC.dispatchEvent(evt);
		}
		if(this._context.parameters.expiryProperty.raw){
			this.inputExp.value = this._context.parameters.expiryProperty.raw;
			evt.initEvent('change', true, true);
			this.inputExp.dispatchEvent(evt);
		}
		//#endregion
	}

	public refreshDataNumber(evt: Event): void {
		this._valueNumber = this.inputNumber.value
		this._notifyOutputChanged();
	}

	public refreshDataName(evt: Event): void {
		this._valueName = this.inputName.value
		this._notifyOutputChanged();
	}

	public refreshDataExp(evt: Event): void {
		this._valueExp = this.inputExp.value
		this._notifyOutputChanged();
	}

	public refreshDataCVC(evt: Event): void {
		this._valueCVC = this.inputCVC.value
		this._notifyOutputChanged();
	}
	/**
	 * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
	 */
	public updateView(context: ComponentFramework.Context<IInputs>): void
	{
		//Set readonly if mode is disable
		if(this._context.mode.isControlDisabled){
			this.inputNumber.setAttribute("readonly","readonly")
			this.inputName.setAttribute("readonly","readonly")
			this.inputCVC.setAttribute("readonly","readonly")
			this.inputExp.setAttribute("readonly","readonly")
		}
		this._valueCVC = context.parameters.cvcProperty.raw;
		this._valueExp = context.parameters.expiryProperty.raw;
		this._valueName = context.parameters.nameProperty.raw;
		this._valueNumber = context.parameters.numberProperty.raw;
		
		this.inputNumber.value =context.parameters.numberProperty.raw ? context.parameters.numberProperty.raw:"" ;
		this.inputName.value =context.parameters.nameProperty.raw ? context.parameters.nameProperty.raw:"";
		this.inputCVC.value =context.parameters.cvcProperty.raw ? context.parameters.cvcProperty.raw:"";
		this.inputExp.value =context.parameters.expiryProperty.raw ? context.parameters.expiryProperty.raw:"" ;
	}

	/** 
	 * It is called by the framework prior to a control receiving new data. 
	 * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
	 */
	public getOutputs(): IOutputs
	{
		return {
			numberProperty:this._valueNumber,
			nameProperty:this._valueName,			
			cvcProperty:this._valueCVC,
			expiryProperty:this._valueExp
		};
	}

	/** 
	 * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
	 * i.e. cancelling any pending remote calls, removing listeners, etc.
	 */
	public destroy(): void
	{
		this.inputCVC.removeEventListener("input", this._refreshDataCVC);
		this.inputName.removeEventListener("input", this._refreshDataName);
		this.inputExp.removeEventListener("input", this._refreshDataExp);
		this.inputNumber.removeEventListener("input", this._refreshDataNumber);
	}
}