import dgram from 'node:dgram';

export function sendUdpCommand(message: string, port: number, host: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const client = dgram.createSocket('udp4');
    const timeout = setTimeout(() => {
      client.close();
      reject(new Error('UDP Timeout'));
    }, 2000); // 2 segundos de espera

    client.on('message', (msg) => {
      clearTimeout(timeout);
      client.close();
      resolve(msg.toString());
    });

    client.send(message, port, host, (err) => {
      if (err) {
        clearTimeout(timeout);
        client.close();
        reject(err);
      }
    });
  });
}