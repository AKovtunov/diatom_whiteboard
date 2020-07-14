import React, { Component, createRef } from 'react';
import {SketchField, Tools} from 'react-sketch';
import shortid from 'shortid';
import { FaMousePointer, FaPen, FaCircle, FaSquare, FaTrash } from 'react-icons/fa';
import Slider from 'react-color';

class Whiteboard extends Component {

  state = {
    text: '',
    myUsername: '',
    tool: Tools.Pencil,
    penWidth: 3,
    messages: [],
    color: this.props.usercolor
  }

  constructor(props) {
    console.log('reinitializing whiteboard')
    super(props);
    this.auto_create_tools = ['circle', 'rect'];
    this.initial_objects = {
      'circle': { radius: 75, fill: 'transparent', stroke: this.state.color, strokeWidth: 3, top: 60, left: 500 },
      'rect': { width: 100, height: 50, fill: 'transparent', stroke: this.state.color, strokeWidth: 3, top: 100, left: 330 },
    }
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
      }
   ];

   this.auto_create_tools = ['circle', 'rect']; // tools that will automatically create their corresponding object when selected

   // next: add settings for auto-created objects
  }

  async componentDidMount() {

    let textGatherer = this._gatherText();

    //
    this.props.group_channel.bind('client-whiteboard-updated', (payload) => {
      textGatherer(payload.data);
      console.log(payload.is_final)
      console.log('whiteboard was updated')
      if (payload.is_final) {
        console.log("FINAL PAYLOAD")
        const full_payload = textGatherer(); // get the gathered text
        let obj = '';
        if (full_payload) {
          obj = JSON.parse(full_payload);

          if (payload.id) {
            Object.assign(obj, { id: payload.id, sender: payload.sender });
          } else {
            Object.assign(obj, { sender: payload.sender });
          }
        }

        if (payload.action === 'add') {
          this._sketch.addObject(JSON.stringify(obj));
        } else if(payload.action === 'update') {
          console.log("UPDATE TRIGGERED WITH")
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
    this.setState({penWidth: event.target.value});
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

  handleChange = (color, event) => {
    console.log(`Set color to ${color.hex}`)
    this.setState({color: color.hex})
  }


  render() {
    console.log('rendering the SketchField in render()')
    console.log(`our color is ${this.state.color}`)
    return (
      <div>
        <SketchField
          className="canvas"
          ref={c => (this._sketch = c)}
          width='1024px'
          height='768px'
          tool={this.state.tool}
          lineColor={this.state.color}
          lineWidth={this.state.penWidth}
          onUpdate={this.sketchUpdated}
          username='xx'
          shortid={shortid} />
        {this.renderTools()}
        {this.state.penWidth}
        <input
          id="typeinp"
          type="range"
          min="1" max="25"
          value={this.state.penWidth}
          onChange={this.handlePenWidthChange}
          step="1"/>
          <input
            type="textarea"
            name="text_to_add"
            id="text_to_add"
            placeholder="Enter text here"
            value={this.state.text}
            onChange={this.onUpdateText} />
          <button type="button" color="primary" onClick={this.addText}>Add Text</button>
          <Slider
            color={ this.state.color }
            onChangeComplete={ this.handleChange }
          />
      </div>
    )
  }

  renderTools = () => {
    return this.tools.map((tool) => {
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
    });
  }

  pickTool = (event) => {
    const button = event.target.closest('button');
    const tool = button.getAttribute('data-tool');
    const tool_name = button.getAttribute('data-name');

    this.setState({
      tool
    }, () => {
      if(this.auto_create_tools.indexOf(tool_name) !== -1){

        const obj = this.initial_objects[tool_name];
        const id = shortid.generate();
        Object.assign(obj, { id: id, type: tool_name });

        this._sketch.addObject(JSON.stringify(obj));

        setTimeout(() => {
          this.setState({
            tool: Tools.Select
          });
        }, 500);

      }

    });
  }

  _gatherText = () => {
    let sentence = '';
    return (txt = '') => {
     return sentence += txt;
    }
  }

  sketchUpdated = (obj, action, sender, id = null) => {
    if (this.state.color) {
        console.log("Updating the sketch")
        let length_per_part = 8000; // maximum number of characters that can be alloted to a FabricJS object
        let loop_count = Math.ceil(obj.length / length_per_part);
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

          this.updateOtherUsers(payload);
          from_str_index += length_per_part;
        }
      }
  }

  updateOtherUsers = (payload) => {
      console.log("Sending update to other users")
    this.props.group_channel.trigger('client-whiteboard-updated', payload);
  }
}

export default Whiteboard;
