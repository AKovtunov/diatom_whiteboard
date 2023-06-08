import React, { Component, createRef } from 'react';
import {SketchField, Tools} from 'react-sketch';
import shortid from 'shortid';
import { FaMousePointer, FaPen, FaCircle, FaSquare, FaTrash, FaGripLines } from 'react-icons/fa';
import MathSymbolList from './MathSymbolList';

class Whiteboard extends Component {

  state = {
    text: '',
    username: this.props.username,
    dimensions: {
      width: 200,
      height: 200
    },
    tool: Tools.Pencil,
    penWidth: 3,
    messages: [],
    color: this.props.usercolor,
    imageUrl: 'https://thumbs.dreamstime.com/z/%D0%B4%D0%B5%D0%BA%D0%B0%D1%80%D1%82%D0%BE%D0%B2%D1%8B%D0%B9-%D1%88%D0%B0%D0%B1-%D0%BE%D0%BD-%D1%81%D0%B8%D1%81%D1%82%D0%B5%D0%BC%D1%8B-%D0%BA%D0%BE%D0%BE%D1%80-%D0%B8%D0%BD%D0%B0%D1%82-67755917.jpg'
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ color: nextProps.usercolor });
  }

  constructor(props) {
    super(props);
    this.tools = [
      {
       name: 'select',
       icon: <FaMousePointer />,
       tool: Tools.Select
      },
      {
       name: 'pencil',
       icon: <FaPen />,
       tool: Tools.Pencil
      },
      {
       name: 'rect',
       icon: <FaSquare />,
       tool: Tools.Rectangle
      },
      {
       name: 'circle',
       icon: <FaCircle />,
       tool: Tools.Circle
      },
      {
       name: 'line',
       icon: <FaGripLines />,
       tool: Tools.Line
      }
   ];
  }

  async componentDidMount() {
    this.setState({
      dimensions: {
        width: this.container.offsetWidth,
        height: this.container.offsetHeight,
      },
    });

    let textGatherer = this._gatherText();

    this.props.group_channel.bind('client-whiteboard-updated', (payload) => {
      textGatherer(payload.data);
      if (payload.is_final) {
        const full_payload = textGatherer(); // get the gathered text
        let obj = '';
        if (full_payload) {
          obj = JSON.parse(full_payload);
          console.log("Object received by users")
          console.log(obj)
          if (payload.id) {
            Object.assign(obj, { id: payload.id, sender: payload.sender });
          } else {
            Object.assign(obj, { sender: payload.sender });
          }

          console.log("Object after parsing")
          console.log(JSON.stringify(obj))
        }

        if (payload.action === 'add') {
          console.log("whiteboard - add")
          this._sketch.addObject(JSON.stringify(obj));
        } else if(payload.action === 'update') {
          console.log("whiteboard - modify")
          console.log(obj)
          this._sketch.modifyObject(JSON.stringify(obj));
        } else if(payload.action === 'remove') {
          this._sketch.setSelected(payload.id);
          this._sketch.removeSelected();
        }

        textGatherer = this._gatherText(); // reset to an empty string
      }

    });
  }

  handlePenWidthChange = (event) => {
    this.setState({penWidth: parseInt(event.target.value)});
    let tool = this.state.tool
    this.setState({
      tool
    });
  }

  onUpdateText = (event) => {
    this.setState({
      text: event.target.value
    });
  }

  addText = () => {
    if (this.state.text) {
      const id = shortid.generate();
      this._sketch.addText(this.state.text, { id }); // add a text object to the canvas

      this.setState({
        text: ''
      });
    }
  }


  render() {
    return (
      <div className="row whiteboard-container">
        <div className="whiteboard col-md-9 col-lg-10" ref={el => (this.container = el)}>
          <SketchField
            className="canvas"
            ref={c => (this._sketch = c)}
            width={ this.state.dimensions.width }
            height={ this.state.dimensions.height }
            tool={this.state.tool}
            lineColor={this.state.color}
            lineWidth={this.state.penWidth}
            onUpdate={this.sketchUpdated}
            username={this.state.username}
            shortid={shortid} />
        </div>
        <div className="col-md-3 col-lg-2">
          <h5>Select Tool:</h5>
          {this.renderTools()}
          <h5>Pen Width:</h5>
          <input
            id="typeinp"
            type="range"
            min="1" max="25"
            value={this.state.penWidth}
            onChange={this.handlePenWidthChange}
            step="1"/>
          {this.state.penWidth}
          <h5>Add Text:</h5>
          <textarea
            name="text_to_add"
            id="text_to_add"
            placeholder="Enter text here"
            value={this.state.text}
            onChange={this.onUpdateText} />
          <button type="button" color="primary" onClick={this.addText}>Add Text</button>
          <h5>Math Symbols:</h5>
          <MathSymbolList />
          <h5>Add Image: </h5>
          <input
            type='text'
            label='Image URL'
            helperText='Copy/Paste an image URL'
            onChange={(e) => this.setState({ imageUrl: e.target.value })}
            value={this.state.imageUrl}/>
          <button
            type="button"
            variant="outlined"
            onClick={(e) => {
              this._sketch.addImg(this.state.imageUrl)
            }}>
            Load Image from URL
          </button>
        </div>
      </div>
    )
  }

  renderTools = () => {
    return <div className="tools">{
      this.tools.map((tool) => {
        return (
          <div className="tool" key={tool.name}>
            <button
              color="secondary"
              size="lg"
              onClick={this.pickTool}
              data-name={tool.name}
              data-tool={tool.tool}
            >
              {tool.icon}
            </button>
          </div>
        );
      })}
      <div className="tool" key="remove">
        <button
          color="danger"
          size="lg"
          onClick={this.removeSelected}
        >
          <FaTrash />
        </button>
      </div>
    </div>
  }

  pickTool = (event) => {
    const button = event.target.closest('button');
    const tool = button.getAttribute('data-tool');
    const tool_name = button.getAttribute('data-name');
    this.setState({
      tool
    });
  }

  removeSelected = () => {
    const activeObj = this._sketch.getSelected();
    let id;
    if (activeObj._objects) {
      activeObj._objects.map((obj) =>{
        const payload = {
          action: 'remove',
          is_final: true,
          id: obj.id,
          sender: this.state.username
        };
        this.updateOtherUsers(payload);
      })

    } else {
      const payload = {
        action: 'remove',
        is_final: true,
        id: activeObj.id,
        sender: this.state.username
      };
      this.updateOtherUsers(payload);
    }

    this._sketch.removeSelected(); // remove the object from the user's canvas
  }

  _gatherText = () => {
    let sentence = '';
    return (txt = '') => {
     return sentence += txt;
    }
  }

  sketchUpdated = (obj, action, sender, id = null) => {
    console.log("Sketch updated")
    if (this.state.color) {
        let length_per_part = 8000; // maximum number of characters that can be alloted to a FabricJS object
        console.log("Object received by sketch")
        console.log(obj)
        let loop_count = Math.ceil(obj.length / length_per_part);
        console.log(`loop_count = ${loop_count}`)
        let from_str_index = 0;
        for (let x = 0; x < loop_count; x++) {
          const str_part = obj.substr(from_str_index, length_per_part);

          const payload = {
            action: action,
            id: id,
            data: str_part,
            sender: sender
          };

          if (x + 1 === loop_count) { // if this is the final part
            Object.assign(payload, { is_final: true });
          }
          console.log("Payload is:")
          console.log(payload)

          this.updateOtherUsers(payload);
          from_str_index += length_per_part;
        }
      }
  }

  updateOtherUsers = (payload) => {
    this.props.group_channel.trigger('client-whiteboard-updated', payload);
  }
}

export default Whiteboard;
