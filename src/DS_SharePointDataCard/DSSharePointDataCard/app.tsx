import * as React from 'react';
import IRecordInformation from './IRecordInformation';
import { PrimaryButton, Icon } from 'office-ui-fabric-react';
import { initializeIcons } from '@uifabric/icons';
import {
    DocumentCard,
    DocumentCardActivity,
    DocumentCardDetails,
    DocumentCardPreview,
    DocumentCardTitle,
    DocumentCardType,
    DocumentCardStatus
  } from 'office-ui-fabric-react/lib/DocumentCard';
  import { ImageFit } from 'office-ui-fabric-react/lib/Image';

  initializeIcons();

const baseProductionCdnUrl ="https://static2.sharepointonline.com/files/fabric/assets/item-types-fluent/48/"

export interface IAppProperties {
    elements:Array<IRecordInformation>
    enableLoadMore:boolean,
    loadNextRecords: ()=>void,
    setSelectedRecord: (recordids:Array<string>) => void
} 
interface IState{
    elements:Array<IRecordInformation>
}
class App extends React.Component<IAppProperties,IState>{
    constructor(props:IAppProperties){
        super(props);
        this.state = {
            elements:props.elements
        }
        this.findNextPage = this.findNextPage.bind(this);
    }
    private selectRecord(id:string){
        let records = this.state.elements;
        let element = records.find(p=> p.id == id)!;
        element.selected = !element.selected;
        this.setState({elements:records});
        this.props.setSelectedRecord( records.filter(p => p.selected).map(p => p.id) );
    }

    private findNextPage(){
        this.props.loadNextRecords();
    }
/*
*/

    render(){
        let elements=  this.props.elements.map((element)=>{
            return (
                
                <div className="customDocumentCard" key={element.id}>
                    <DocumentCard type={DocumentCardType.normal} 
                        className={element.selected ? "selected" : ""}  
                        style={{maxWidth:"320px"}} 
                    >      
           
                        
                        <div onClick={()=>{window.open(element.absoluteUrl+"?web=1")}}>
                            <DocumentCardPreview   previewImages={[{
                                name: element.name,
                                previewImageSrc: element.siteUrl+"/_layouts/15/getpreview.ashx?path="+element.absoluteUrl,
                                height:170, 
                                imageFit:ImageFit.centerCover,
                                iconSrc: baseProductionCdnUrl+element.ext, 
                            }]} >
                                >
                                <div style={{textAlign:"right"}}>

                                </div>

                                </DocumentCardPreview>
                        </div>
                        <Icon 
                                        className={element.selected ? "selectedCard" : "emptySelect"} 
                                        iconName={ element.selected ? "StatusCircleCheckmark" : "StatusCircleOuter" } 
                                        onClick={()=>{ this.selectRecord(element.id) }}
                        />
                        <div onClick={()=>{ this.selectRecord(element.id) }}>
                            <DocumentCardDetails >
                                <DocumentCardTitle
                                    title={element.name}
                                    shouldTruncate={true}
                                />
                                <DocumentCardActivity activity={"Created: "+ element.date } people={[{ name: element.user, profileImageSrc: "" }]} />
                            </DocumentCardDetails>
                        </div>
                        <DocumentCardStatus status="" className="cardStatus" statusIcon={element.isCheckOut ? "PageCheckedOut" : "DocumentApproval"} >
                        </DocumentCardStatus>   
                    </DocumentCard>
                </div>
                
            )
        })
        return(
            <div className="customContainer">
                <div className="customBody">
                    {elements}
                </div>
                <br/><PrimaryButton style={{marginLeft:"10px"}} disabled={!this.props.enableLoadMore}  onClick={this.findNextPage}>Load more</PrimaryButton>
            </div>
        )
    }



}

export default App;