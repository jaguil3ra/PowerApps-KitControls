# Shortcut buttons

This is control let you to create shortcut buttons (max 4) to open quick form or main form of other entities from entity record.

You must to use the primary field of the entity for this component, example: fullname for contact entity, then you could repeat this field in the form.

For configure the buttons you need a json with these properties: entity, quickForm (boolean),title, background, icon ([Fabric Icons](https://developer.microsoft.com/en-us/fabric#/styles/web/icons)), description. You can use these samples:

`{"entity":"contact","quickForm":true,"title":"Add Contact","background":"#4caf50","icon":"ContactInfo", "description":"Add a new contact to account"}`

`{"entity":"new_customEntity","quickForm":true,"title":"Add Credit","background":"#673ab7","icon":"PaymentCard", "description":"Add a new credit to account"}`

`{"entity":"incident","quickForm":false,"title":"Create Case","background":"#e91e63","icon":"Headset", "description":"Create a new case to account"}`

`{"entity":"task","quickForm":true,"title":"Task","background":"#3c7739","icon":"TaskLogo", "description":"Create a new task"}`

`{"entity":"email","quickForm":true,"title":"Email","background":"#0078d4","icon":"Mail", "description":"Create a new email"}`

`{"entity":"appointment","quickForm":true,"title":"Appointment","background":"#636580","icon":"CalendarAgenda", "description":"Create a new appointment"}`

`{"entity":"phonecall","quickForm":true,"title":"Phone Call","background":"#5458af","icon":"Phone", "description":"Create a new phonecall"}`


**Note**: for testing in the harness you need add these parameters on the url `?etn=xyz&id=1`, example: http://127.0.0.1:8181?etn=xyz&id=1




*Download managed solution ready for install **[here](solution/ShortcutButtonsSolution.zip)***

![](../../assets/gif/shortcutbuttons.gif)


![](../../assets/gif/shortcutbuttons2.gif)

