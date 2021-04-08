import React, { Component } from "react";
import AceEditor from "react-ace";
import "ace-builds/webpack-resolver";

import "ace-builds/src-noconflict/theme-tomorrow";
import "ace-builds/src-noconflict/theme-twilight";

import "ace-builds/src-noconflict/mode-typescript";
import "ace-builds/src-noconflict/mode-c_cpp";

import "ace-builds/src-noconflict/ext-language_tools";
import Compiler from "../../compiler/Compiler";
import Beautify from "ace-builds/src-noconflict/ext-beautify";
import "./Home.css";
import { Interpreter } from "../../interpreter/Interpreter";
import { BsGearWideConnected } from "react-icons/bs";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface IProps {}

interface IState {
  input: string;
  output: string;
  currentLine: number;
  isDebugging: boolean;
  stack: number[];
  heap: number[];
  variables: Map<string, number>;
  console: string;
  resized: boolean;
  canMoveForward: boolean;
}

export class Home extends Component<IProps, IState> {
  constructor(props: any) {
    super(props);
    this.state = {
      input: "",
      output: "",
      currentLine: 0,
      isDebugging: false,
      stack: [],
      heap: [],
      console: "",
      variables: new Map(),
      resized: false,
      canMoveForward: false,
    };
  }

  sleep = (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  handleCompile = async () => {
    const { input } = this.state;
    if (!input) {
      toast.warning("Input editor is empty!");
      return;
    }
    const compiler = new Compiler(input);
    const result = compiler.compile();
    const { state, message } = result;
    if (!state) {
      toast.error(message);
      return;
    }
    toast.success(message);
    const output = compiler.getOutput();
    this.setState({ output, isDebugging: false });
    await this.sleep(0.01);
    this.handleBeautify(true);
  };

  handleDebug = () => {
    let { isDebugging, canMoveForward } = this.state;
    if (!canMoveForward) {
      if (isDebugging) {
        toast.warning(`You've reached the end, please, start again`);
      } else {
        toast.warning(`First, you must start debbuging!`);
      }
      return;
    }
    const interpreter = Interpreter.getInstance();
    const currentLine = interpreter.goForward() - 1;
    const hasEnded = interpreter.getEnd();
    const console = interpreter.getConsole();
    const sessionRef = this.refs.output;
    //@ts-ignore
    const editor = sessionRef.editor;
    editor.scrollToLine(currentLine, true, true, function () {});
    if (hasEnded) {
      isDebugging = !isDebugging;
      canMoveForward = !canMoveForward;
    }
    this.setState({
      stack: interpreter.getStack(),
      heap: interpreter.getHeap(),
      variables: interpreter.getVariables(),
      currentLine,
      console,
      isDebugging,
      canMoveForward,
    });
  };

  handleStart = () => {
    const { output } = this.state;
    if (!output) {
      toast.warning("Output editor is empty!");
      return;
    }
    const interpreter = Interpreter.getInstance();
    const { line, state, message } = interpreter.restart(output);
    if (!state) {
      toast.error(message);
      return;
    }
    const sessionRef = this.refs.output;
    //@ts-ignore
    const editor = sessionRef.editor;
    editor.scrollToLine(line - 1, true, true, function () {});
    let { isDebugging, canMoveForward } = this.state;
    canMoveForward = isDebugging ? false : true;
    this.setState({
      stack: interpreter.getStack(),
      heap: interpreter.getHeap(),
      variables: interpreter.getVariables(),
      isDebugging: !isDebugging,
      currentLine: line - 1,
      canMoveForward,
      console: "",
    });
  };

  handleInput = (e: any) => {
    this.setState({ input: e });
  };
  handleOutput = (e: any) => {
    this.setState({ output: e });
  };
  handleLine = () => {
    this.setState({ currentLine: this.state.currentLine + 1 });
  };
  handleBeautify = async (origin: boolean) => {
    const sessionRef = origin ? this.refs.output : this.refs.input;
    //@ts-ignore
    const editor = sessionRef.editor;
    Beautify.beautify(editor.session);
    const content = editor.getSession().getValue();
    origin
      ? this.setState({ output: content })
      : this.setState({ input: content });
  };

  componentDidMount() {
    window.addEventListener("resize", this.resize.bind(this));
    this.resize();
  }

  resize() {
    const { resized } = this.state;
    if (window.innerWidth <= 760 && !resized) {
      toast.warning("Ahora en español, no lo haga compa :c");
      this.setState({ resized: true });
    } else if (window.innerWidth > 760 && resized) {
      this.setState({ resized: false });
    }
  }
  componentWillUnmount() {
    window.removeEventListener("resize", this.resize.bind(this));
  }

  render() {
    let { heap, stack, isDebugging, variables, canMoveForward } = this.state;
    const renderStack = stack.map((e, u) => {
      return (
        <tr>
          <td>{u} </td>
          <td>{e}</td>
        </tr>
      );
    });

    const renderHeap = heap.map((e, u) => {
      return (
        <tr>
          <td>{u} </td>
          <td>{e}</td>
        </tr>
      );
    });
    const renderVariables = Array.from(variables.keys()).map((key) => {
      return (
        <tr>
          <td>{key} </td>
          <td>{variables.get(key)}</td>
        </tr>
      );
    });

    return (
      <>
        <nav>
          <h1>TAC demo</h1>
          <ul>
            <li>
              <a href="https://github.com/einjunge99/mistery-box">
                Code avaiable here
              </a>
            </li>
          </ul>
        </nav>
        <div className="container">
          <div>
            <div className="compile-title" onClick={this.handleCompile}>
              <h2>
                Compile <BsGearWideConnected className="gear-icon" />
              </h2>
            </div>
            <div className="options">
              <div className="start-title" onClick={this.handleStart}>
                {isDebugging ? "Restart" : "Start"}
              </div>
              <div
                style={canMoveForward ? { opacity: 1 } : { opacity: 0.4 }}
                className="forward-title"
                onClick={this.handleDebug}
              >
                Next Line
              </div>
            </div>
            <div className="content-container">
              <div className="ace-container">
                <AceEditor
                  ref="input"
                  width="500px"
                  height="400px"
                  mode="typescript"
                  theme="twilight"
                  showPrintMargin={false}
                  onChange={this.handleInput}
                  highlightActiveLine={true}
                  editorProps={{ $blockScrolling: true }}
                  commands={[
                    {
                      name: "beautify",
                      bindKey: { win: "shift-Alt-f", mac: "shift-Alt-f" },
                      exec: () => this.handleBeautify(false),
                    },
                  ]}
                />
                <AceEditor
                  ref="output"
                  mode="c_cpp"
                  theme="twilight"
                  width="500px"
                  height="400px"
                  onChange={this.handleOutput}
                  showPrintMargin={false}
                  value={this.state.output}
                  highlightActiveLine={true}
                  editorProps={{ $blockScrolling: true }}
                  markers={[
                    {
                      startRow: this.state.currentLine,
                      startCol: 0,
                      endRow: this.state.currentLine,
                      endCol: 100,
                      className: "replacement_marker",
                      type: "text",
                    },
                  ]}
                />
              </div>
              <div>
                <div className="structure-wrapper example">
                  <table className="structure-table">
                    <caption>Stack</caption>
                    <thead>
                      <tr>
                        <th>i</th>
                        <th>Value</th>
                      </tr>
                    </thead>
                    <tbody>{renderStack}</tbody>
                  </table>
                </div>
              </div>
              <div>
                <div className="structure-wrapper example">
                  <table className="structure-table">
                    <caption>Heap</caption>
                    <thead>
                      <tr>
                        <th>i</th>
                        <th>Value</th>
                      </tr>
                    </thead>
                    <tbody>{renderHeap}</tbody>
                  </table>
                </div>
              </div>
            </div>
            <div className="content-container">
              <AceEditor
                mode="typescript"
                theme="tomorrow"
                width="1000px"
                height="200px"
                showPrintMargin={false}
                value={this.state.console}
                highlightActiveLine={true}
                editorProps={{ $blockScrolling: true }}
                markers={[
                  {
                    startRow: this.state.currentLine,
                    startCol: 0,
                    endRow: this.state.currentLine,
                    endCol: 100,
                    className: "replacement_marker",
                    type: "text",
                  },
                ]}
              />
              <div>
                <div className="variable-wrapper example">
                  <table className="variable-table">
                    <caption>Variables</caption>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Value</th>
                      </tr>
                    </thead>
                    <tbody>{renderVariables}</tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          <ToastContainer />
        </div>
      </>
    );
  }
}

export default Home;
