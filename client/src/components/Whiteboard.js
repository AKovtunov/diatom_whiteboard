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

  render() {
    return (
      <SketchField
        className="canvas"
        ref={c => (this._sketch = c)}
        width='1024px'
        height='768px'
        tool={this.state.tool}
        lineColor='#EE92C2'
        lineWidth={3}
        onUpdate={this.sketchUpdated}
        username='xx'
        shortid={shortid} />
    )
  }



  sketchUpdated = (obj, action, sender, id = null) => {
    console.log(this.props.group_channel)
    this.props.group_channel.trigger('client-whiteboard-updated', id);
    console.log(obj)
    console.log(action)
    console.log(sender)
    console.log(id)
  }
}

export default Whiteboard;
