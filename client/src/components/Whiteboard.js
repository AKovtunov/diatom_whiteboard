import React, { Component, createRef } from 'react';
import {SketchField, Tools} from 'react-sketch';
import shortid from 'shortid'; // for generating unique IDs

class Whiteboard extends Component {

  state = {
    text: '',
    myUsername: '',
    tool: Tools.Pencil,
    messages: []
  }

  async componentDidMount() {

    let textGatherer = this._gatherText();

    this.props.group_channel.bind('client-whiteboard-updated', (payload) => {
      textGatherer(payload.data);
      console.log('whiteboard was updated')
      if (payload.is_final) {
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
          this._sketch.modifyObject(JSON.stringify(obj));
        } else if(payload.action === 'remove') {
          this._sketch.setSelected(payload.id);
          this._sketch.removeSelected();
        }

        textGatherer = this._gatherText(); // reset to an empty string
      }

    });
  }

  render() {
    return (
      <SketchField
        className="canvas"
        ref={c => (this._sketch = c)}
        width='1024px'
        height='768px'
        tool={this.state.tool}
        lineColor={this.props.usercolor}
        lineWidth={3}
        onUpdate={this.sketchUpdated}
        username='xx'
        shortid={shortid} />
    )
  }

  _gatherText = () => {
    let sentence = '';
    return (txt = '') => {
     return sentence += txt;
    }
  }

  sketchUpdated = (obj, action, sender, id = null) => {
    if (this.props.usercolor) {

        let length_per_part = 8000; // maximum number of characters that can be alloted to a FabricJS object
        let loop_count = Math.ceil(obj.length / length_per_part);

        let from_str_index = 0;
        for (let x = 0; x < loop_count; x++) {
          const str_part = obj.substr(from_str_index, length_per_part);

          const payload = {
            action: action,
            id: id,
            data: str_part,
            sender: this.state.usercolor
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
    this.props.group_channel.trigger('client-whiteboard-updated', payload);
  }
}

export default Whiteboard;
