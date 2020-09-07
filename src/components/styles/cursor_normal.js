import React from 'react'
import styled from 'styled-components'

const SVGIconWrapper = styled.svg.attrs({xmlns: "http://www.w3.org/2000/svg", width: 20, height: 20, viewBox: "0 0 23.165 31.179"})`
    > path {
        transition: fill 0.2s;
    }
`
// transform="translate(-14.502 -11.793) scale(0.9)"
export default (props) => (
    <SVGIconWrapper>
        <path id="" className="cursor-normal" fill={props.fill || "#696969"} stroke={props.fill || "#696969"} d="M21,15.929V44.672l8.269-9.165H42.38Z" transform="translate(-16.502 -13.793) scale(1)"/>
    </SVGIconWrapper>
)