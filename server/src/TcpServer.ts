import Net from 'net';

const host = "127.0.0.1";

export const videoPort = 8081;
export const audioPort = 8082;

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