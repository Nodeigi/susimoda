SHELL := /bin/bash

# include variables
include config/minikube.conf
export

MINIKUBE=minikube --profile=susimoda

# kubernetes settings
KUBECTL=kubectl

# should we create configuration or apply it?
KUBECTL_CREATE_METHOD=apply

all: minikube-init mount-nfs-dir create-mysql wait-for-mysql fetch-repository create-rest

minikube-init:
	@ echo "Check if minikube is already running. If not - start it!"
	@ if [[ `$(MINIKUBE) status --format {{.MinikubeStatus}}` != *"Running"* ]]; then $(MINIKUBE) start; fi
	@ echo "Waiting a moment to give the change to run minikube by itself"
	@ echo -n "Waiting until minikube will be running"
	@ while [[ `$(MINIKUBE) status --format {{.MinikubeStatus}}` != *"Running"* ]]; do sleep 3;  echo -n "."; done
	@ echo -e "\nminikube is ready to go!"

shutdown: unmount-nfs-dir
	$(MINIKUBE) stop

##############################################################################
## REPOSITORIES ##############################################################
##############################################################################

minikube-expose-nfs:
	echo "Prepare minikube to expose NFS server"
	$(MINIKUBE) ssh -- sudo 'chmod 777 /data'
	$(MINIKUBE) ssh -- sudo 'sh -c "echo \"/data 0.0.0.0/0.0.0.0(rw,async,no_subtree_check)\" > /etc/exports"'
	$(MINIKUBE) ssh -- sudo 'systemctl restart nfs-server.service'
	
mount-nfs-dir: minikube-expose-nfs
	echo "Mount NFS disk from minikube"
	$(eval MINIKUBE_IP:=$(shell $(MINIKUBE) ip))
	mkdir -p -m 777 $(CURDIR)/src
	sudo sh -c 'mountpoint -q $(CURDIR)/src || mount -t nfs -o resvport,rw,nfsvers=3,nolock,proto=udp,port=2049 $(MINIKUBE_IP):/data $(CURDIR)/src'
	sudo sh -c 'cat /etc/hosts | grep -v susimoda.local.io > /tmp/hosts && echo "$(MINIKUBE_IP)	susimoda.local.io" >> /tmp/hosts && mv /tmp/hosts /etc/hosts'
	
unmount-nfs-dir:
	echo "Unmount NFS disk from minikube"
	sudo umount $(CURDIR)/src -f

create-dirs:
	mkdir -p -m 777 $(CURDIR)/src/rest
	
fetch-repository: create-dirs
	@ echo "Get rest repository"
	@ if [ ! -d $(CURDIR)/src/rest/.git ] ; \
	then \
		git clone -b $(REST_GIT_BRANCH) $(REST_GIT_REPO) $(CURDIR)/src/rest ; \
	fi
	@ chmod -R 777 $(CURDIR)/src/rest

##############################################################################
## MYSQL #####################################################################
##############################################################################

create-mysql:
	@ echo "Run MySQL server pod"
	envsubst < k8s/storage/mysql.yaml | $(KUBECTL) $(KUBECTL_CREATE_METHOD) -f -
	envsubst < k8s/deployment/mysql.yaml | $(KUBECTL) $(KUBECTL_CREATE_METHOD) -f -
	envsubst < k8s/service/mysql.yaml | $(KUBECTL) $(KUBECTL_CREATE_METHOD) -f -
	
destroy-mysql:
	@ echo "Destroy MySQL server pod"
	envsubst < k8s/deployment/mysql.yaml | $(KUBECTL) delete -f -
	envsubst < k8s/service/mysql.yaml | $(KUBECTL) delete -f -
	envsubst < k8s/storage/mysql.yaml | $(KUBECTL) delete -f -

wait-for-mysql:
	@ echo "Waiting for POD with MySQL app running...";
	@ while [[ `kubectl get pod -l app=mysql-server -o jsonpath='{.items[*].status.phase}'` != "Running" ]]; do sleep 3;  echo -n "."; done
	$(eval POD_DATABASE_NAME:=$(shell $(KUBECTL) get pods -l "app=mysql-server" -o jsonpath='{.items[*].metadata.name}'))
	-while !(kubectl exec -it ${POD_DATABASE_NAME} -- mysqladmin -w ping  -uroot -p$(MYSQL_PASSWORD)); do sleep 2;  echo -n "."; done

##############################################################################
## REST ######################################################################
##############################################################################

create-rest:
	docker run -it -w /usr/src/app -v $(CURDIR)/src/rest/app:/usr/src/app node:10.7 npm install
	envsubst < k8s/storage/rest.yaml | $(KUBECTL) $(KUBECTL_CREATE_METHOD) -f -
	envsubst < k8s/deployment/rest.yaml | $(KUBECTL) $(KUBECTL_CREATE_METHOD) -f -
	envsubst < k8s/service/rest.yaml | $(KUBECTL) $(KUBECTL_CREATE_METHOD) -f -

destroy-rest:
	envsubst < k8s/deployment/rest.yaml | $(KUBECTL) delete -f -

rest: destroy-rest create-rest
