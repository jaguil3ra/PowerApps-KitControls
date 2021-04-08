# SharePoint DocumentCard for D365 CE and the Model Driven Apps

This is a custom control for DataSet. The viewer work with SharePoint and OneDrive files that are associated with entity records. Currently the viewer doesn't work with subsite files. 

This control uses [office fabric controls](https://developer.microsoft.com/en-us/fabric#/controls/web) 

# How use in D365 CE/ Model Driven View

You need clone the view "All SharePoint Document" (Save as) in the **SharePointDocument** entity.

![](../../assets/pictures/sharepoint-entity.jpg)

The view must show the columns: fullname, author, absoluteurl, sharepointcreatedon and also use this configuration in the control:

![](../../assets/pictures/sp-view-configuration.jpg)


*Download managed solution ready for install **[here](solution/DS_SharePointDataCardSolution/bin/Debug/DS_SharePointDataCardSolutionp)***

![](../../assets/gif/sharepointdocumentcard.gif)





For more info you can to go my page: [https://jaguil3ra.com](https://jaguil3ra.com)