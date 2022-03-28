import Net from "net";

const host = '127.0.0.1';
export const videoPort = 8081;
export const audioPort = 8082;

export type onTcpData = (data: Buffer) => void;

export const createListener = (port: number, onData: onTcpData) => {
  const client = new Net.Socket();

  console.log("Created TCP client for port ", port);

  client.connect({ port: port, host: host }), () => {
      console.log(`New TCP connection to ${host}:${videoPort}`);
  };
  
  client.on('data', function(chunk) {
    console.log(`Data`, chunk);
    onData(chunk);
  });
}