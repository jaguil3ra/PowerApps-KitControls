import * as React from 'react';
import { CompoundButton, IButtonStyles, Button, initializeIcons} from 'office-ui-fabric-react';
//import { initializeIcons } from '@uifabric/icons';
import IButtonProperty from './IButtonProperty';
initializeIcons();


interface IAppProperties{
    type:"CompoundButtonCenter" | "CompoundButtonLeft" | "ButtonOnlyIcon" | "NormalButton" ,
    showDescription:boolean,
    enable:boolean,
    elements:Array<IButtonProperty>,
    buttonSize:"Medium" | "Large",
    openForm:(entity:string, isQuickForm:boolean)=>void
}

const App = (props:IAppProperties)=>{
    let buttons =Array<JSX.Element>();

    props.elements.forEach( (item:IButtonProperty, index:number) => {
        const Styles:IButtonStyles = {
            root:{
                background: item.background,
                color:"#FFF",
                margin:"10px",
                minWidth:"120px"
            },
            rootPressed:{
                background: item.background,
                color:"#FFF"
            },
            rootHovered:{
                background: item.background,
                color:"#FFF",
                opacity: 0.9
            },
            description:{
                color:"#FFF"
            },
            descriptionHovered:{
                color:"#FFF"
            },
            icon:{
                marginRight: props.type != "CompoundButtonLeft" ? "0px" : undefined,
            }
        }

        if(props.type != "NormalButton"){
            Styles.flexContainer ={
                flexDirection:"row",
                display: props.type == "CompoundButtonLeft" ? "flex":"block",
                color:"#FFF",
                textAlign:"center"
            }
            if(props.type =="CompoundButtonCenter"){
                let textStyle ={
                    color:"#FFF",
                    textAlign:"center"
                }
                Styles.description = textStyle
                Styles.textContainer = textStyle
            }
        }
        

        if(props.type == "NormalButton"){
            let button = <Button key={index}  styles={Styles} iconProps={{iconName:item.icon}}
            disabled={!props.enable}
            onClick={()=>{ props.openForm(item.entity,item.quickForm!)}}
            >{item.title}</Button>;
            buttons.push(button);
        }else if(props.type == "CompoundButtonCenter" || props.type == "CompoundButtonLeft"){
            let button = <CompoundButton key={index} styles={Styles}  secondaryText={ props.showDescription ? item.description: ""} 
                            disabled={!props.enable}
                            onClick={()=>{ props.openForm(item.entity,item.quickForm!)}}
                            iconProps={
                                item.icon ? {iconName:item.icon,  className:props.buttonSize == "Medium" ? "icon-M" : "icon-L" } :undefined           
                            }>
                            {item.title}
                            
                        </CompoundButton>
            buttons.push(button);
        }else {
            let button = <CompoundButton key={index} styles={Styles} 
                            disabled={!props.enable}
                            onClick={()=>{ props.openForm(item.entity,item.quickForm!)}}
                            iconProps={
                                {iconName:item.icon ? item.icon : "Picture", className:props.buttonSize == "Medium" ? "icon-M" : "icon-L"}          
                            }>
                        </CompoundButton>
            buttons.push(button);
        }
    })

    return(
        <div >
            {buttons}                                             
        </div>

        
    )
}
export default App;
