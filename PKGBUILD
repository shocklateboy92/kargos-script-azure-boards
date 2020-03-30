# This is an example PKGBUILD file. Use this as a start to creating your own,
# and remove these comments. For more information, see 'man PKGBUILD'.
# NOTE: Please fill out the license field for your package! If it is unknown,
# then please put 'unknown'.

# Maintainer: Your Name <devel@lasath.org>
pkgname=kargos-script-azure-boards
pkgver=1.3
pkgrel=1
pkgdesc="My Kargos script to check for PRs in Azure Devops"
arch=('any')
url="https://github.com/shocklateboy92/kargos-script-azure-boards"
license=('MIT')
groups=('kargos')
depends=('nodejs')
makedepends=('yarn')
checkdepends=()
optdepends=()
provides=()
conflicts=()
replaces=()
backup=()
options=()
install=
changelog=
source=()
noextract=()
md5sums=()
validpgpkeys=()

build() {
    yarn;
}

install_file() { 
    mkdir -p "$2";
    cp "$1" "$2/";
}

package() {
    destdir="${pkgdir}/usr/local";
	yarn build --mode=production;

    install_file "./font-awesome-bug.svg" "$destdir/share/icons";
    install_file "./kargos-script.azure-boards.6m.sh" "$destdir/bin";
}

