import Net from 'net';

const host = "127.0.0.1";

export const videoPort = 8081;
export const audioPort = 8082;

// const server1 = new Net.Server();
// const server2 = new Net.Server();

// server1.listen(audioPort, host, function() {
//     console.log(`Server1 listening for connection requests on socket ${host}:${videoPort}`);
// });

// server2.listen(videoPort, host, function() {
//   console.log(`Server2 listening for connection requests on socket ${host}:${audioPort}`);
// });

// server1.on('connection', function(socket) {
//     console.log('A new connection has been established.');

//     socket.on('data', function(chunk) {
//         console.log(`Data received from client`, chunk);
//     });

//     socket.on('end', function() {
//         console.log('Closing connection with the client');
//     });

//     socket.on('error', function(err) {
//         console.log(`Error: ${err}`);
//     });
// });

// server2.on('connection', function(socket) {
//   console.log('[2] A new connection has been established.');

//   socket.on('data', function(chunk) {
//       console.log(`[2] Data received from client`, chunk);
//   });

//   socket.on('end', function() {
//       console.log('[2] Closing connection with the client');
//   });

//   socket.on('error', function(err) {
//       console.log(`[2] Error: ${err}`);
//   });
// });

type OnData = (data: Buffer) => void;

export class TcpServer {
  private port: number = null;
  private server: Net.Server = null;
  private onData: OnData = null;

  constructor (port: number) {
    this.port = port;

    this.initialize();
  }

  private initialize = () => {
    this.server = new Net.Server();

    this.server.listen(this.port, host, () => {
      console.log(`${this.serverData()} Created new server`);
    });

    this.server.on('connection', (socket) => {
      console.log(`${this.serverData()} A new connection has been established`);
  
      socket.on('data', (chunk) => {
        if (this.onData) {
          this.onData(chunk);          
        } 
      });
  
      socket.on('end', () => {
          console.log(`${this.serverData()} Closing connection with the client`);
      });
  
      socket.on('error', (err) => {
          console.log(`${this.serverData()} Error: ${err}`);
      });
    });
  }

  public setDataHandler = (handler: OnData) => {
    this.onData = handler;
  }

  private serverData = () => {
    return `[TCP server :${this.port}]`;
  }
}