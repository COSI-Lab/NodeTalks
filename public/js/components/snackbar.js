class Snackbar {
    constructor(type, icon, message) {
        this.snackbar = document.createElement('div');
        this.snackbar.classList = `snackbar snackbar-${type}`;
        this.snackbar.innerHTML = `
            <i data-feather="${icon}"></i>
            <p>${message}</p>
            <i data-feather="x" onclick="this.close()"></i>
        `;

        document.querySelectorAll('.snackbar').forEach(snackbar => snackbar.remove());

        document.body.appendChild(this.snackbar);
        feather.replace();

        this.snackbar.animate(
            [
                {transform: 'translateY(80px)'},
                {transform: 'translateY(0px)'}
            ],
            {
                duration: 300,
                easing: 'ease-in-out'
            }
        );

        this.snackbar.querySelector('.feather-x').addEventListener('click', e => this.close());

        setTimeout(() => this.close(), 10000);
    }

    close() {
        let anim = this.snackbar.animate(
            [
                {transform: 'translateY(0px)'},
                {transform: 'translateY(80px)'}
            ],
            {
                duration: 300,
                easing: 'ease-in-out'
            }
        );
        anim.onfinish = function() { document.querySelector('.snackbar').remove(); }
        anim.play();
    }
}