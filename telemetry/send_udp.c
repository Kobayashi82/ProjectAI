#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <arpa/inet.h>
#include <sys/time.h>

#define BUFFER_SIZE 4096

int main(int argc, char *argv[]) {
	int					sockfd;
	struct sockaddr_in	server_addr;
	struct timeval		timeout;
	char				buffer[BUFFER_SIZE];
	char				mensaje[BUFFER_SIZE];
	socklen_t			addr_len = sizeof(server_addr);
	char				*host;
	char				*texto;
	int					puerto;
	int					timeout_sec = 2;
	ssize_t				recibido;

	if (argc < 4) {
		printf("Usage: %s <ip> <port> <message>\n", argv[0]);
		return (1);
	}

	host = argv[1];
	texto = argv[3];
	puerto = atoi(argv[2]);

	sprintf(mensaje, "%s\r\n", texto);

	memset(&server_addr, 0, sizeof(server_addr));
	server_addr.sin_family = AF_INET;
	server_addr.sin_port = htons(puerto);

	if (inet_pton(AF_INET, host, &server_addr.sin_addr) <= 0) {
		fprintf(stderr, "Error: invalid IP address\n");
		return (1);
	}

	if ((sockfd = socket(AF_INET, SOCK_DGRAM, 0)) < 0) {
		perror("Error creating socket");
		return (1);
	}

	timeout.tv_sec = timeout_sec;
	timeout.tv_usec = 0;
	setsockopt(sockfd, SOL_SOCKET, SO_RCVTIMEO, &timeout, sizeof(timeout));

	printf("Enviando: %s\n", texto);
	sendto(sockfd, mensaje, strlen(mensaje), 0, (struct sockaddr *)&server_addr, sizeof(server_addr));

	recibido = recvfrom(sockfd, buffer, BUFFER_SIZE - 1, 0, (struct sockaddr *)&server_addr, &addr_len);

	if (recibido > 0) {
		buffer[recibido] = '\0';
		printf("%s\n", buffer);
	}

	close(sockfd);
	return (0);
}

/* For K-Desktop, sends UDP commands */
/* gcc -std=c89 -Wall -o send_udp send_udp.c */
