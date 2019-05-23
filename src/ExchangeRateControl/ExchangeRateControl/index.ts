import {IInputs, IOutputs} from "./generated/ManifestTypes";
import { instanceOf, string } from "prop-types";


interface PopOptions extends ComponentFramework.FactoryApi.Popup.Popup{
	popupStyle: {
	}
}

interface ExchangeRateProperty{
	base:string,
	date:string,
	rates:any
}


export class ExchangeRateControl implements ComponentFramework.StandardControl<IInputs, IOutputs> {
	
	private readonly apiUrl:string = "https://api.exchangeratesapi.io/";
	
	private _allCurrencyExchangeRate:ExchangeRateProperty;

	private _currencyValue:string;
	private _exchangeRateValue:number;
	private _dateValue:Date;

	private _labelErrorNotificacion: HTMLLabelElement;


	private _inputExchangeRate:HTMLInputElement;
	private _labelCurrency:HTMLLabelElement;
	private _thExchangeTitle:HTMLTableCellElement;

	private _notifyOutputChanged: () => void;
	private _context: ComponentFramework.Context<IInputs>
	private _container: HTMLDivElement;

	private _buttonOpenPop: HTMLButtonElement;

	private _tbodyContainer: HTMLTableSectionElement;

	private _popContainer : HTMLDivElement;

	private _popService: ComponentFramework.FactoryApi.Popup.PopupService;

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
		this._notifyOutputChanged = notifyOutputChanged;

		
		this._container = document.createElement("div");
		
		this._inputExchangeRate = document.createElement("input");
		this._inputExchangeRate.setAttribute("type","number");
		this._inputExchangeRate.setAttribute("min","0");
		this._inputExchangeRate.setAttribute("class","customInputRate");
		this._inputExchangeRate.readOnly=true;

		this._labelCurrency = document.createElement("label");
		this._labelCurrency.setAttribute("class","customLabelCurrency")

		
		this._container.appendChild(this._labelCurrency);
		this._container.appendChild(this._inputExchangeRate);

		this._popContainer = document.createElement("div");
		this._popContainer.setAttribute("class","customPopContainer")
		
		let _buttonClosePop = document.createElement("button");
		_buttonClosePop.setAttribute("class","customButtonClose");
		_buttonClosePop.textContent="X";
		_buttonClosePop.addEventListener("click",()=>{
			this._popService.closePopup("exchangeRatePop")
		})
		this._popContainer.appendChild(_buttonClosePop);


		let table = document.createElement("table");

		this._container.appendChild(this._popContainer);
		this._popContainer.appendChild(table);

		

		table.setAttribute("class","custom-table");
		
		let thead = document.createElement("thead");
		table.appendChild(thead);

		//Main Exchange Rate
		this._tbodyContainer = document.createElement("tbody");		
		table.appendChild(this._tbodyContainer);


		let tr0 = document.createElement("tr");
		thead.appendChild(tr0);

		this._thExchangeTitle = document.createElement("th");
		tr0.appendChild(this._thExchangeTitle);

		this._thExchangeTitle.setAttribute("colspan","2");
		this._thExchangeTitle.setAttribute("style","min-width:300px");
		

		let tr1 = document.createElement("tr");
		thead.appendChild(tr1);

		let thCurrency = document.createElement("th");
		tr1.appendChild(thCurrency);
		thCurrency.innerText="Currency";
		

		let thRate = document.createElement("th");
		tr1.appendChild(thRate);
		thRate.innerText="Rate";
		
		
		this._popService = this._context.factory.getPopupService();
		const popUpOptions: PopOptions = {
			closeOnOutsideClick: false,
			content: this._popContainer,
			name: "exchangeRatePop",
			type: 1,
			popupStyle: {
				position: "absolute",
				overflowX:"hidden",
				overflowY:"auto",
				flexDirection:"column",
				alignItems: "flex-end",
				background:"red",
				maxHeight:"100%",
				bottom:"0px",
				top:"0px",
				left:"auto",
				right:"0px",
				minWidth:"340px",
				backgroundColor: "rgb(255, 255, 255)",
				boxShadow: "rgb(0, 0, 0) 0px 25.6px 57.6px 0px, rgb(0, 0, 0) 0px 4.8px 14.4px 0px"
			}
		}
		this._popService.createPopup(popUpOptions);		
		this._buttonOpenPop  = document.createElement("button");
		this._buttonOpenPop.setAttribute("class","exchangeButton");
		this._buttonOpenPop.textContent=".";
		this._buttonOpenPop.addEventListener("click",this.openPopModal.bind(this));

		this._tbodyContainer.addEventListener("click",this.getCurrenTrFromTable.bind(this))	
		this._container.appendChild(this._buttonOpenPop);

		this._labelErrorNotificacion = document.createElement("label");
		this._labelErrorNotificacion.hidden = true;
		this._labelErrorNotificacion.setAttribute("class","hidden");
		this._container.appendChild(this._labelErrorNotificacion);
		container.appendChild(this._container);


		this._buttonOpenPop.setAttribute("class", this._context.mode.isControlDisabled ? "hidden": "exchangeButton");
		this._buttonOpenPop.disabled = this._context.mode.isControlDisabled;


		this.initializeValuesAndTag();

	}
	/**
	 * This function inicialize all tag label content and input values
	 */
	private initializeValuesAndTag(){
		if(this._context.mode.isControlDisabled){
			this._labelCurrency.textContent = this._context.parameters.currencyTargetProperty.raw;
			this._inputExchangeRate.value = this._context.parameters.rateExchangeProperty.raw.toString();
			return;
		}

		if(!this._context.parameters.dateProperty.raw){
			this.setCurrenciesRateFromApi(this._context.parameters.currencyBaseProperty.raw,this._context.parameters.currencyDefaultProperty.raw,undefined,()=>{	
				this._dateValue = new Date();

				//CurrencyValue is set with default currency target 
				this._currencyValue = this._context.parameters.currencyDefaultProperty.raw;
				
				this._inputExchangeRate.value= this._allCurrencyExchangeRate.rates[this._context.parameters.currencyDefaultProperty.raw];

				this._exchangeRateValue =this._allCurrencyExchangeRate.rates[this._context.parameters.currencyDefaultProperty.raw];

				this._labelCurrency.textContent = this._currencyValue;
				//Set PoP's title tag
				this._thExchangeTitle.textContent= "Base: "+this._context.parameters.currencyBaseProperty.raw+" - Date: "+this._dateValue.toLocaleDateString();
				this._notifyOutputChanged();
			})			
		}else{			
			this._currencyValue = this._context.parameters.currencyTargetProperty.raw ? this._context.parameters.currencyTargetProperty.raw: this._context.parameters.currencyDefaultProperty.raw;
			
			this._dateValue = this._context.parameters.dateProperty.raw;
			let dateFormat = this.getDateInFormat(this._context.parameters.dateProperty.raw);
			this.setCurrenciesRateFromApi(this._context.parameters.currencyBaseProperty.raw,this._currencyValue,dateFormat,()=>{
				this._exchangeRateValue = this._context.parameters.rateExchangeProperty.raw ? this._context.parameters.rateExchangeProperty.raw : this._allCurrencyExchangeRate.rates[this._currencyValue];
				
				this._inputExchangeRate.value =this._exchangeRateValue.toString();
				this._labelCurrency.textContent = this._currencyValue;
				this._thExchangeTitle.textContent= "Base: "+this._context.parameters.currencyBaseProperty.raw+" - Date: "+this._context.parameters.dateProperty.raw.toLocaleDateString();
				this._notifyOutputChanged();
			});
		}

	}


	private getDateInFormat(date:Date):string{
		let month:string|number = (date.getMonth()+1);
		month= (month as number) <10 ? "0"+month : month;
		let day:string|number = date.getDate();
		day = day < 10 ? "0"+day : day;
		return date.getFullYear() + "-" +month+"-"+ day;
	}

	private openPopModal():void{
		this._popService.openPopup("exchangeRatePop")
	
	}

	/**
	 * 
	 * @param base is the currency base to exchange
	 * @param target is the currency object
	 * @param date is the date for to do query to api
	 * @param callback is the function executie next from set value _allCurrenciesRate
	 */
	private setCurrenciesRateFromApi(base:string,target:string,date?:string, callback?:()=>void  ){
		let dateSearch = date? date :"latest";

		if(this._allCurrencyExchangeRate != undefined && date == this._allCurrencyExchangeRate.date){
			return;
		}

		while (this._tbodyContainer.firstChild) {
			this._tbodyContainer.removeChild(this._tbodyContainer.firstChild);
		}
		
		fetch(this.apiUrl+dateSearch+ "?base="+base).then((response)=>{
			this._labelErrorNotificacion.setAttribute("class","hidden")
			response.json().then((result)=>{
				this._allCurrencyExchangeRate = result;
				if(callback){
					callback();
				}
				for (let [key, value] of Object.entries(result.rates)) {
					let nwTr = document.createElement("tr");
					nwTr.setAttribute("data-value",key);
					let nw1Td = document.createElement("td");
					let nw2Td = document.createElement("td");
					nwTr.appendChild(nw1Td);
					nwTr.appendChild(nw2Td);
					nw1Td.textContent = key;
					nw2Td.textContent = value.toString();
					this._tbodyContainer.appendChild(nwTr);
				}
			});
		}).catch((error)=>{
			console.log(error);
			this._labelErrorNotificacion.setAttribute("class","customErrorLabel")
			this._labelErrorNotificacion.textContent="ERROR FROM API!";
		})
	}


	private getCurrenTrFromTable(ev:Event){
		let currentHTMLElement = ev.target as HTMLElement;
		let parent = currentHTMLElement.parentElement;		
		if(parent != null && parent instanceof HTMLTableRowElement ){
			let currencyTarget = parent.getAttribute("data-value")
			if(currencyTarget){
				this._exchangeRateValue =this._allCurrencyExchangeRate.rates[currencyTarget] as number;
				this._inputExchangeRate.value=this._allCurrencyExchangeRate.rates[currencyTarget];
				this._currencyValue = currencyTarget;
				this._labelCurrency.textContent = currencyTarget;
				this._notifyOutputChanged();
				this._popService.closePopup("exchangeRatePop")
			}
		}
	}


	/**
	 * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
	 */
	public updateView(context: ComponentFramework.Context<IInputs>): void
	{

		if(this._context.parameters.dateProperty.raw.toLocaleDateString() != this._dateValue.toLocaleDateString() && !this._context.mode.isControlDisabled){
			this._dateValue = this._context.parameters.dateProperty.raw;
			this._currencyValue = this._context.parameters.currencyTargetProperty.raw ? this._context.parameters.currencyTargetProperty.raw: this._context.parameters.currencyDefaultProperty.raw

			let dateFormat = this.getDateInFormat(this._context.parameters.dateProperty.raw);
			this.setCurrenciesRateFromApi(this._context.parameters.currencyBaseProperty.raw,this._currencyValue,dateFormat,()=>{				
				this._exchangeRateValue = this._context.parameters.rateExchangeProperty.raw != 0 ? this._context.parameters.rateExchangeProperty.raw : this._allCurrencyExchangeRate.rates[this._currencyValue];
				this._inputExchangeRate.value=this._allCurrencyExchangeRate.rates[this._currencyValue];
				this._labelCurrency.textContent = this._currencyValue;
				this._thExchangeTitle.textContent= "Base: "+this._context.parameters.currencyBaseProperty.raw+" - Date: "+this._dateValue.toLocaleDateString();
				this._notifyOutputChanged();
			});			
		}
		//Hidden button if control if disabled!
		this._buttonOpenPop.setAttribute("class", this._context.mode.isControlDisabled ? "hidden": "exchangeButton");
		this._buttonOpenPop.disabled = this._context.mode.isControlDisabled;
	}

	
	/** 
	 * It is called by the framework prior to a control receiving new data. 
	 * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
	 */
	public getOutputs(): IOutputs
	{
		return {
			rateExchangeProperty:this._exchangeRateValue,
			currencyTargetProperty:this._currencyValue,
			dateProperty:this._dateValue
		};
	}

	/** 
	 * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
	 * i.e. cancelling any pending remote calls, removing listeners, etc.
	 */
	public destroy(): void
	{
		this._tbodyContainer.removeEventListener("click",this.getCurrenTrFromTable)
	}
}