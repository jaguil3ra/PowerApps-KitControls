# Exchange Rate Control

This is a custom control that call the api of https://exchangeratesapi.io/ for get the exchange rates and save the select value and currency

# How Use in D365 CE/PowerApps CDS Form

This control need to has a binding with a field type "DateAndTime.DateOnly" for get the values of the date. In the configuration your select currency base and currency default for exchange rate. The values are save in:

- A main field for save the rate (of type currency | decimal)
- A field for save the currency (of type Singleline.Text and should hidden in the form)


*Download managed solution ready for install **[here](solution/ExchangeRateControl.zip)***

<a href="https://www.youtube.com/watch?v=SzZeOQf7OqI" ><img src="../../assets/pictures/exchange-rate-preview.jpg" 
alt="IMAGE ALT TEXT HERE" width="100%" height="100%" border="10" /></a>


For more info you can to go my page: [https://jaguil3ra.com](https://jaguil3ra.com)