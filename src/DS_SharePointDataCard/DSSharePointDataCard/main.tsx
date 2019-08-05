import * as React from 'react';
import IRecordInformation from './IRecordInformation';
import { PrimaryButton } from 'office-ui-fabric-react';
import {
    DocumentCard,
    DocumentCardActivity,
    DocumentCardDetails,
    DocumentCardPreview,
    DocumentCardTitle,
    DocumentCardType,
  } from 'office-ui-fabric-react/lib/DocumentCard';
  import { ImageFit } from 'office-ui-fabric-react/lib/Image';



const baseProductionCdnUrl ="https://static2.sharepointonline.com/files/fabric/assets/item-types-fluent/48/"

interface IProperties {
    elements:Array<IRecordInformation>
    enableLoadMore:boolean,
    loadNextRecords: ()=>void
} 
const App = (props:IProperties)=>{

    let elements=  props.elements.map((element)=>{
        return (<div className="customDocumentCard" key={element.id}>
        <DocumentCard type={DocumentCardType.normal} onClick={()=>{window.open(element.absoluteUrl+"?web=1")}} style={{maxWidth:"320px"}}>
            <DocumentCardPreview  previewImages={[{
                name: element.name,
                previewImageSrc: element.siteUrl+"/_layouts/15/getpreview.ashx?path="+element.absoluteUrl,
                height:150, 
                imageFit:ImageFit.center,
                iconSrc: baseProductionCdnUrl+element.ext, 
            }]} />
            <DocumentCardDetails>
            <DocumentCardTitle
                title={element.name}
                shouldTruncate={true}
            />
            <DocumentCardActivity activity={"Created: "+ element.date } people={[{ name: element.user, profileImageSrc: "" }]} />
            </DocumentCardDetails>
        </DocumentCard>
        </div>)
    })

    return(
        <div className="customContainer">
            <div className="customBody">{elements}</div>
            <br/><PrimaryButton style={{marginLeft:"10px"}} disabled={!props.enableLoadMore} onClick={()=>{props.loadNextRecords()}}>Load more</PrimaryButton>
        </div>
    )
}

export default App;