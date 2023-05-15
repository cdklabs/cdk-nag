FROM jsii/superchain:1-buster-slim-node18

USER root

# Change uid/guid of superchain so it can work with the docker-in-docker feature
RUN groupmod --gid 1000 superchain \
  && usermod --uid 1000 --gid 1000 superchain \
  && chown -R 1000:1000 /home/superchain

# Setup dependencies
RUN yarn install
RUN chmod -R 777 node_modules

# Setup pre-commit
RUN python3 -m pip install pre-commit

USER superchain

# Setup oh-my-zsh
RUN sudo apt-get update && export DEBIAN_FRONTEND=noninteractive \
  && sudo apt-get -y install --no-install-recommends zsh vim git-all \
  && sudo rm -rf /var/lib/apt/lists/* \
  && sudo chsh -s $(which zsh) $(whoami)
RUN sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" "" --unattended \
  && sudo sh -c 'echo "[oh-my-zsh]\n        hide-dirty = 1" > /etc/gitconfig'