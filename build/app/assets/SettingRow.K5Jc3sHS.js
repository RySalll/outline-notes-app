import{n as i,F as e,ad as d,a1 as l,Y as o,d as t,j as n}from"./index.30dQFFTZ.js";const a=i(e).withConfig({componentId:"sc-1i2i6ep-0"})(["display:block;padding:22px 0;border-bottom:1px solid ",";",";&:last-child{border-bottom:0;}"],(i=>!1===i.$border?"transparent":d(.5,i.theme.divider)),l("tablet")`
    display: flex;
  `),r=i.div.withConfig({componentId:"sc-1i2i6ep-1"})(["display:flex;flex-direction:column;flex-basis:100%;flex:1;&:first-child{min-width:70%;}&:last-child{min-width:0;}",";"],l("tablet")`
    p {
      margin-bottom: 0;
    }
  `),s=i(o).withConfig({componentId:"sc-1i2i6ep-2"})(["margin-bottom:4px;"]),SettingRow=({visible:i,description:e,name:d,label:l,border:c,children:p})=>!1===i?null:t(a,{gap:32,$border:c,children:[t(r,{children:[n(s,{as:"h3",children:n("label",{htmlFor:d,children:l})}),e&&n(o,{as:"p",type:"secondary",children:e})]}),n(r,{children:p})]});export{SettingRow as S};
