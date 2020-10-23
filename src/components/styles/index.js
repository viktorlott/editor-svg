import styled,{ css } from 'styled-components'

export const NavContainer = styled.div`
    width: 100%;
    height: 50px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 10px;

`

const selected_color = "#579aff"

export const NavButton = styled.button`
    border: 0;
    outline: 0;
    box-shadow: none;
    padding: 10px;
    background: #e8e8e8;
    border-radius: 5px;
    color: ${props => props.isSelected ? selected_color : "#828282"};
    margin: 0 5px;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: background 0.2s;

    > path {
      fill: #989898!important;
    }

    > h3 {
        transition: color 0.2s;
        margin: 0;
        padding: 0;
        color: ${props => props.isSelected ? selected_color : "#828282"};
        font-weight: 800;
        font-size: 24px;
    }

    > i {
        transition: color 0.2s;
    }

    &:hover {
        /* cursor: pointer; */
        background: #e2e2e2;
    }

    &:hover > i {
        color: ${props => props.isSelected ? selected_color : "#565656"};
    }

    &:hover > h3 {
        color: ${props => props.isSelected ? selected_color : "#565656"};
    }

  
`

export const Icon = styled.i.attrs(props => ({ className: props.type || ""}))`
    ${props => props.size ? `font-size: ${props.size};` : ""}
`


export const StageContainer = styled.div`
    display: grid;
    justify-content: center;
    grid-template-columns: 1fr 794px 1fr;
    grid-template-rows: 70px auto calc(100vh - 50px - 150px);
`

export const CanvasWrapper = styled.div`
    
     
     grid-column: 2/3;
     grid-row: 2/3;

     border-radius: 2px;
     /* background-color: white; */

     & canvas {
        border-radius: 2px;
        /* border: 2px solid #e6e6e6; */
        /* background-color: white!important; */
        border: 1px solid #dadada!important;
        /* box-shadow: 0px 0px 6px 1px rgba(0,0,0,0.05); */
     }

`


export const LeftSide = styled.div`

     grid-column: 1/2;
     grid-row: 1/4;
`

export const RightSide = styled.div`
     display: grid;
     grid-template-columns: 1fr 250px;
     grid-template-rows: 100px repeat(6, 1fr);
     grid-column: 3/4;
     grid-row: 1/4;

`

export const SideMenu = styled.div`
     display: grid;
     grid-template-columns: 1fr 250px;
     grid-template-rows: 100px 1fr;
     grid-column: 2/3;
     grid-row: 1/ last-line;
     /* background: #efefef;
     border-left: 1px solid #ccc; */
     z-index: 1;
`


export const SideMenuHeader = styled.div`
     display: flex;
     justify-content: center;
     align-items: center;

     grid-column: 2/3;
     grid-row: 1/ 2;


     & > h2 {
         color: #989898;
         font-weight: 600;
     }
`

export const SideMenuParameters = styled.div`
     display: flex;
     /* justify-content: center; */

     flex-flow: column;

     grid-column: 2/3;
     grid-row: 2/ 3;
`


export const Options = styled.div`
  position: relative;
  background-color: #e8e8e8;
  width: ${props => props.width ? props.width : "auto"};
  float: left;
  max-width: 100%;
  border-radius: 5px;
  margin: 5px;

  transition: background-color 0.2s;

  &:hover {
      background-color: #e2e2e2;
  }

  >select {

    font-size: 1rem;
    font-size: 14px;
    font-weight: 500;
    max-width: 100%;
    width:100%;
    color: #989898;
    padding: 8px 24px 8px 10px;
    border: none;
    background-color: transparent;
    -webkit-appearance: none;
       -moz-appearance: none;
            appearance: none;
    &:active,
    &:focus {
      outline: none;
      box-shadow: none;
    }
  }
  &:after {
    content: " ";
    position: absolute;
    top: 50%;
    margin-top: -2px;
    right: 8px;
    width: 0; 
    height: 0; 
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-top: 5px solid #aaa;
  }

`


export const Input = styled.input`
  position: relative;
  background-color: #e8e8e8;
  width: ${props => props.width ? props.width : "auto"};
  ${props => props.height ? `height: ${props.height};` : ""}
  margin: 5px;
  
  float: left;
  /* max-width: 100%; */
  border-radius: 5px;
  transition: background-color 0.2s;

  &:hover {
      background-color: #e2e2e2;
  }

  &::-webkit-inner-spin-button {
    border-radius: 5px;
    display: none;
  }

  &::-webkit-color-swatch {
    border-color: transparent;
  }
  appearance: none;
  -moz-appearance: none;
  -webkit-appearance: none;
  background: none;
  &::-webkit-color-swatch{
    border: 0;
    border-radius: 5px;
  }


  font-size: 1rem;
  font-size: 14px;
  font-weight: 500;
  max-width: 100%;
  color: #989898;
  padding: 8px 10px 8px 10px;
  border: none;
  -webkit-appearance: none;
     -moz-appearance: none;
          appearance: none;
  &:active,
  &:focus {
    outline: none;
    box-shadow: none;
  }
  ${props => props.type !== "color" ? css`
    &:after {
        content: " ";
        position: absolute;
        top: 50%;
        margin-top: -2px;
        right: 8px;
        width: 0; 
        height: 0; 
        border-left: 5px solid transparent;
        border-right: 5px solid transparent;
        border-top: 5px solid #aaa;
    }
  `: css`
        ${'' /* &:after {
            content: " ";
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: ${props => props.value};
            border-radius: 5px;
        } */}
  `}

`
export const FormWrapper = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    flex-flow: column;

    & > div.block-picker {
      margin-top: 5px;
    }

    & > input[type="color"] {
      padding: 0;
      border-radius: 98px;
      overflow: hidden;
      height: 30px;
      background: none;
    }
`


export const AttributeSection = styled.div`

`