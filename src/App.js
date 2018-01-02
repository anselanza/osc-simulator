import React, { Component } from 'react';
import io from 'socket.io-client';
import { Col, Jumbotron, FormGroup, FormControl, Button, ControlLabel } from 'react-bootstrap';

const socket = io('http://localhost:5000');

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      received: [],
      destination: {
        ip: "127.0.0.1",
        port: 12345
      },
      address: "/test",
      params: [
        "one"
      ]
    }

    this.updateDestinationIp = this.updateDestinationIp.bind(this);
    this.updateDestinationPort = this.updateDestinationPort.bind(this);
    this.updateAddress = this.updateAddress.bind(this);
    this.updateParams = this.updateParams.bind(this);

  }

  componentDidMount() {
    socket.on('connect', () => {
      console.info('connected to backend');
      socket.on('message', (data) => {
        console.log('received message:', data);
        let newMessage = {
          address: data[0],
          message: data,
          timestamp: Date.now()
        }
        this.setState({ received: [...this.state.received, newMessage] });
      });
    });

  }

  updateDestinationIp(event) {
    this.setState({ destination: { ...this.state.destination, ip: event.target.value } });
  }

  updateDestinationPort(event) {
    this.setState({ destination: { ...this.state.destination, port: event.target.value } });
  }

  updateAddress(event) {
    this.setState({ address: event.target.value });
  }

  updateParams(event) {

  }




  render() {

    const messagesReceived = this.state.received.map( msg =>
      <li key={msg.timestamp}>{JSON.stringify(msg)}</li>
    );

    const customParams = this.state.params.map( (param, index) =>
        <FormGroup key={"param-" + index}>
          <ControlLabel>Param #{index+1}</ControlLabel>
          <FormControl type="text" value={param} onChange={this.updateParams} />
        </FormGroup>
    );

    return (
      <div className="container">
        <Jumbotron>
          <h1>OSC Simulator</h1>
        </Jumbotron>
        <h2>Send OSC</h2>

        <h6>Destination server</h6>

        <form>
          <FormGroup>
            <label>ip address</label>
            <FormControl type="text" onChange={this.updateDestinationIp} value={this.state.destination.ip} />
          </FormGroup>

          <FormGroup>
            <label>port</label>
            <FormControl type="text" onChange={this.updateDestinationPort} value={this.state.destination.port} />
          </FormGroup>

          <FormGroup>
            <Button type="button" onClick={() => { this.sendOsc('dummy', ['frombrowser', 0, 0.1])} }>Dummy Test</Button>
            <p>Sends to {this.state.destination.ip}:{this.state.destination.port} <tt>dummy/</tt> the message <tt>frombrowser, 0, 0.1</tt></p>
          </FormGroup>

          <hr />

          <FormGroup>
            <label>address</label>
            <FormControl type="text" onChange={this.updateAddress} value={this.state.address} />
          </FormGroup>

          <Col md={12}>
            <h2>Custom params</h2>
            <FormGroup>
              {customParams}
            </FormGroup>
            <FormGroup>
              <Button onClick={() => { this.setState( { params: [...this.state.params, "new"] } )}}>Add Param</Button>
              <Button onClick={() => { this.sendOsc( this.state.address, this.state.params )}}>Send</Button>
            </FormGroup>
          </Col>

        </form>

        <h2>Received OSC @ 127.0.0.1:12345</h2>
        <em>{messagesReceived.length} messages</em>
        <ul>
          {messagesReceived}
        </ul>

        <code>{JSON.stringify(this.state, null, 4)}</code>

      </div>

    );
  }

  // blobToArray(blob) {
  //   return [
  //     parseInt(blob.id),
  //     parseFloat(blob.x),
  //     parseFloat(blob.y)
  //   ]
  // }

  sendOsc(address, data) {
    console.log('send OSC:', address, data);
    let ip = this.state.destination.ip;
    let port = this.state.destination.port;
    console.log(ip, port);
    socket.emit('message', { address, data, ip, port });
  }
}

export default App;
