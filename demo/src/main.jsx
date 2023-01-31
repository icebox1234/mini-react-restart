// import React from "react";
// import ReactDOM from "react-dom";
import { ReactDOM, Component, useReducer } from '../which-react';

import './index.css';

function reducer(state, action) {
    const { type, payload = 1 } = action;
    switch (type) {
        case 'ADD':
            return state + payload;
    }
}

function FunctionComponent(props) {
    const [count, setCount] = useReducer(reducer, 0);
    return (
        <div className="border">
            <p>{props.name}</p>
            <p
                onClick={() => {
                    setCount({ type: 'ADD', payload: 2 });
                }}
            >
                count is: {count}
            </p>
        </div>
    );
}

class ClassComponent extends Component {
    render() {
        return (
            <div className="border">
                <h3>{this.props.name}</h3>
                我是文本
            </div>
        );
    }
}

function FragmentComponent() {
    return (
        // <ul>
        //     <>
        //         <li>part1</li>
        //         <li>part2</li>
        //     </>
        // </ul>
        <>
            <div>1</div>
            <div>2</div>
        </>
    );
}

const jsx = (
    <div className="border">
        <h1>react</h1>
        <a href="https://github.com/bubucuo/mini-react">mini react</a>
        <FunctionComponent name="函数组件" />
        <ClassComponent name="类组件" />
        <FragmentComponent />
    </div>
);
// function App() {
//     return (
//         <div className="border">
//             <h1>react</h1>
//             <a href="https://github.com/bubucuo/mini-react">mini react</a>
//             {/* <FunctionComponent name="函数组件" />
//             <ClassComponent name="类组件" />
//             <FragmentComponent /> */}
//         </div>
//     );
// }

ReactDOM.createRoot(document.getElementById('root')).render(jsx);

// 实现了常见组件初次渲染

// 原生标签
// 函数组件
// 类组件
// 文本
// Fragment
