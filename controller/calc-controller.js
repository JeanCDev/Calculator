class CalcController{
    constructor(){
        
        //atributos privados
        this._audio = new Audio('click.mp3');
        this._audioOnOff = false;
        this._lastOperator = '';
        this._lastNumber = '';
        
        this._operation = [];
        this._locale = 'pt-br';
        this._displayCalcEl = document.querySelector('#display');
        this._dateEl = document.querySelector('#data');
        this._timeEl = document.querySelector('#hora');
        this._currentDate;
        this.initialize();
        this.initButtonEvents();
        this.initKeyBoard();
        
    }
    
    // copiar um numero da calculadora
    copyToClipboard(){
        
        let input = document.createElement('input');
        
        input.value = this.displayCalc;
        
        document.body.appendChild(input);
        
        input.select();
        
        document.execCommand('Copy');
        
        input.remove();
        
    }
    
    //colar um numero na calculadora
    
    pasteFromClipboard(){
        
        document.addEventListener('paste', e=>{
           
           let text = e.clipboardData.getData('Text');
            
           this.displayCalc = parseFloat(text);
            
        });
        
    }
    
    // definição inicial da calculadaora
    initialize(){
        
        //fazer relógio funcionar 
        this.setDisplayDateTime();
        
        setInterval(()=>{
            
            this.setDisplayDateTime();
            
        }, 1000);
        
        this.setLastNumberToDisplay();
        
        this.pasteFromClipboard();
        
        // ativar o som das teclas
        document.querySelectorAll('.btn-ac').forEach(btn=>{
           
            btn.addEventListener('dblclick', e => {
               
                this.toggleAudio();
                
            });
            
        });
    }
    
    // me´todo para ligar e desligar o som
    toggleAudio(){
        
        this._audioOnOff = !this._audioOnOff;
        
    }
    
    //metodo que contola o som propriamente dito
    playAudio(){
        
        if(this._audioOnOff){
            
            this._audio.currentTime = 0;
            this._audio.play();
            
        }
        
    }
    
    // define as teclas do teclado
    initKeyBoard(){
        
        document.addEventListener('keyup', e=>{
            
            this.playAudio();
            
            switch(e.key){
                case 'Escape':
                case 'Delete':
                    this.clearAll();
                    break;

                case 'Backspace':
                    this.cancelEntry();
                    break;
                    
                case '-':
                case '*':
                case '/':
                case '%':
                case '+':
                    this.addOperation(e.key);
                    break;
                
                case 'Enter':
                case '=':
                    this.calc();
                    break;

                case ',':
                case '.':
                    this.addDot();
                    break;

                case '0':
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                case '7':
                case '8':
                case '9':
                    this.addOperation(parseInt(e.key));
                    break;
                    
                case 'c':
                    if(e.ctrlKey)this.copyToClipboard();
                    break;
            }
            
        });
        
    }
    
    //escutar todos os eventos de mouse e teclado
    addEventListenerAll(element, events, fn){
        
        events.split(' ').forEach(event => {
            
            element.addEventListener(event, fn, false);
            
        });
        
    }
    
    // limpar dados da calculadora
    clearAll(){
        
        this._operation = [];
        this._lastNumber = '';
        this._lastOperator = '';
        
        this.setLastNumberToDisplay();
        
    }
    
    //cancela ultima entrada
    cancelEntry(){
        
        this._operation.pop();
        
        this.setLastNumberToDisplay();
        
    }
    
    //identifica tamanho do array
    getLastOperation(){
        
        return this._operation[this._operation.length - 1];
        
    }
    
    // substitui valores em separado por um unico no array
    setLastOperation(value){
        
        this._operation[this._operation.length - 1] = value;
        
    }
    
    // identifica se o valor digitado é uma operação
    isOperator(value){
        
        return (['+', '-', '*', '%', '/'].indexOf(value) > -1);
        
    }
    
    //adicionar operado ao array
    pushOperation(value){
        
        this._operation.push(value);
        
        if(this._operation.length > 3){
            
            this.calc();
            
        }
        
    }
    
    // pega resultado da ultima operação
    getResult(){
        
        try{
            
            // se não houver erro executa:
            return eval(this._operation.join(''));
            
        } catch(e){
            
            //define se houve erro
            setTimeout(() =>{
                this.setError();
            }, 1);
            
        }
        
    }
    
    //calcular dois ultimos numero do array
    calc(){
        
        let last = '';
        
        this._lastOperator = this.getLastItem();
        
        if(this._operation.length < 3){
            
            let firstItem = this._operation[0];
            this._operation = [firstItem, this._lastOperator, this._lastNumber];
            
        }
        
        if(this._operation.length > 3){
        
            last = this._operation.pop();
            
            this._lastNumber = this.getResult();
            
        } else if(this._operation.length == 3){
            
            this._lastNumber = this.getLastItem(false);
           
        } 
        
        let result = this.getResult();
        
        if(last == '%'){
            
            result /= 100;
            
            this._operation = [result];
            
        } else{
            
            this._operation = [result];
            
            if(last) this._operation.push(last);
            
        }
        
        this.setLastNumberToDisplay();
        
    }
    
    // descobre ultimo numero digitado
    getLastItem(isOperator = true){
        
        let lastItem;
        
        for(let i = this._operation.length -1; i >=0 ; i--){
            
            if(this.isOperator(this._operation[i]) == isOperator){

                lastItem = this._operation[i];
                    
                    break;
                        
                }
            }
        
        if(!lastItem){
            
            lastItem = (isOperator) ? this._lastOperator : this._lastNumber;
            
        }
        
        return lastItem;
        
    }
    
    
    //colocar ultimo numero digitado n display
    setLastNumberToDisplay(){
        
        let lastNumber = this.getLastItem(false);
        
        if(!lastNumber){lastNumber = 0}
        
        this.displayCalc = lastNumber;
        
    }
    
    
    // adiciona item ao array de operações
    addOperation(value){
        
        //identifica se é um número ou não
        if(isNaN(this.getLastOperation())){
            
            //string - operadores
            if(this.isOperator(value)){
                
                //trocar operador
                this.setLastOperation(value);
                
            } else{
                
                this.pushOperation(value);
                
                this.setLastNumberToDisplay();
            }
            
        } else{
            
            //determinar como reagir a aoperadores
            if(this.isOperator(value)){
                
                this.pushOperation(value);
                
            } else{
                
                //number - numero a serem convertidos para string
                let newValue = this.getLastOperation().toString() + value.toString();
                this.setLastOperation(newValue);
                
                //atualizar display
                this.setLastNumberToDisplay();
                
            }
            
        }
        
    }
    
    // erro ao deixar em branco
    setError(){
        
        this.displayCalc = 'ERROR';
        
    }
    
    // trata o ponto do teclado
    addDot(){
        
        let lastOperation = this.getLastOperation();
        
        // verifica se já tem um ponto
        if(typeof lastOperation === 'string' && lastOperation.split('') .indexOf('.') > -1) return;
        
        //adiciona o ponto se não for digitado nenhum numero ou em um numero
        if(this.isOperator(lastOperation) || !lastOperation){
            
            this.pushOperation('0.');
            
        } else{
            
            this.setLastOperation(lastOperation.toString() + '.');
            
        }
        
        this.setLastNumberToDisplay()
        
    }
    
    //identifica o valor do botão
    execBtn(value){
        
        this.playAudio();
        
        switch(value){
            case 'ac':
                this.clearAll();
                break;
                
            case 'ce':
                this.cancelEntry();
                break;
                
            case 'soma':
                this.addOperation('+');
                break;
                
            case 'subtracao':
                this.addOperation('-');
                break;
                
            case 'multiplicacao':
                this.addOperation('*');
                break;
                
            case 'divisao':
                this.addOperation('/');
                break;
                
            case 'porcento':
                this.addOperation('%');
                break;
                
            case 'igual':
                this.calc();
                break;
                
            case 'ponto':
                this.addDot();
                break;
                
                case '0':
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                case '7':
                case '8':
                case '9':
                    this.addOperation(parseInt(value));
                    break;
                
            default:
                this.setError();
        }
    }
    
    // define funcionalidade dos botões da calculadora
    initButtonEvents(){
        
        //seleciona todos os botões
        let buttons = document.querySelectorAll('#buttons > g, #parts > g');
        
        // Detectar botões com base no evento
        buttons.forEach((btn, index)=>{
            
            this.addEventListenerAll(btn, 'click drag', e=>{
                
                let textBtn = btn.className.baseVal.replace('btn-', '');
                
                this.execBtn(textBtn);
                
            });
            
            // substituir cursor
            this.addEventListenerAll(btn, 'mouseover mousedown mouseup', e=>{
                
                btn.style.cursor = 'pointer';
                
            });
            
        }); 
        
    }
    
    // faz relógio aparecer desde carregada a página
    setDisplayDateTime(){
        
        this.displayDate = this.currentDate.toLocaleDateString(this._locale,{
            
            day:'2-digit',
            month:"short",
            year: 'numeric'
            
        });
        
        this.displayTime = this.currentDate.toLocaleTimeString(this._locale);
        
    }
    
    //pegar valor do display
    get displayCalc(){
        
        return this._displayCalcEl.innerHTML;
        
    }
    
    //atribui valor ao display
    set displayCalc(value){
        
        if(value.toString().length > 10){
            
            this.setError();
            return false;
            
        }
        
        this._displayCalcEl.innerHTML = value;
        
    }
    
    // pegar data atual
    get currentDate(){
        
        return new Date();
        
    }
    
    // define data atual
    set currentDate(value){
        
        this._currentDate = value;
        
    }
    
    // pega data e hora do display
    get displayTime(){
        
        return this._timeEl.innerHTML;
        
    }
    get displayDate(){
        
        return this._dateEl.innerHTML;
        
    }
    
    // define data e hora no display
    set displayTime(value){
        
        return this._timeEl.innerHTML = value;
        
    }
    set displayDate(value){
        
        this._dateEl.innerHTML = value;
        
    }
}