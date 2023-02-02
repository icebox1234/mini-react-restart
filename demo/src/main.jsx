// import React from "react";
// import ReactDOM from "react-dom";
import {
    ReactDOM,
    Component,
    useReducer,
    useState,
    useEffect,
    useLayoutEffect,
} from '../which-react';

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
    const [state, setState] = useState(10);


    useEffect(() => {
        console.log('effect');
    }, [state]);
    
    useLayoutEffect(() => {
        console.log('layout effect');
    }, [state]);

    

    return (
        <div className="border">
            <p>{props.name}</p>
            <p
                onClick={() => {
                    setCount({ type: 'ADD', payload: 1 });
                }}
            >
                count is: {count}
            </p>
            <p
                onClick={() => {
                    setState(state + 1);
                }}
            >
                state is: {state}
            </p>
            <p>{count % 2 ? <div>omg</div> : <span>123</span>}</p>
            <ul>
                {state % 2
                    ? [2, 1, 3, 4].map((item) => {
                          return <li key={item}>{item}</li>;
                      })
                    : [0, 1, 2, 3, 4].map((item) => {
                          return <li key={item}>{item}</li>;
                      })}
            </ul>
        </div>
    );
}

function Maptest() {
    return (
        <div>
            {[1, 2, 3, 4].map((item) => {
                return <span key={item}>{item}</span>;
            })}
            {[1, 2, 3, 4].map((item) => {
                return <span key={item}>{item}</span>;
            })}
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
        <Maptest />
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
