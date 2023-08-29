import { WebSocketGateway, SubscribeMessage, MessageBody, OnGatewayConnection, OnGatewayDisconnect, WebSocketServer } from '@nestjs/websockets';
import { StatusService } from './status.service';
import { CreateStatusDto } from './dto/create-status.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class StatusGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly statusService: StatusService) {}

  @WebSocketServer()
  server: Server;

  handleConnection(socket: Socket) {
    console.log('New client connected');
    console.log('Client:');
    console.log(socket.client);
    console.log('ID:');
    console.log(socket.id);
    this.server.emit('connection', 'Hello world!');
  }

  handleDisconnect(client) {
    console.log('Client disconnected');
  }

  @SubscribeMessage('connection')
  connection(@MessageBody() data: string): string {
    console.log(data);
    return 'Hello world!';
  }

  @SubscribeMessage('createStatus')
  create(@MessageBody() createStatusDto: CreateStatusDto) {
    return this.statusService.create(createStatusDto);
  }

  @SubscribeMessage('findAllStatus')
  findAll() {
    return this.statusService.findAll();
  }

  @SubscribeMessage('findOneStatus')
  findOne(@MessageBody() id: number) {
    return this.statusService.findOne(id);
  }

  @SubscribeMessage('updateStatus')
  update(@MessageBody() updateStatusDto: UpdateStatusDto) {
    return this.statusService.update(updateStatusDto.id, updateStatusDto);
  }

  @SubscribeMessage('removeStatus')
  remove(@MessageBody() id: number) {
    return this.statusService.remove(id);
  }
}
