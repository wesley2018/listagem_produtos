import { Component, OnInit, ViewChildren, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControlName } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { Usuario } from '../models/usuario';
import { ContaService } from '../services/conta.service';
import { FormBaseComponent } from 'src/app/base-components/form-base.component';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent extends FormBaseComponent implements OnInit {

  @ViewChildren(FormControlName, { read: ElementRef }) formInputElements: ElementRef[];

  errors: any[] = [];
  loginForm: FormGroup;
  usuario: Usuario;
  returnUrl: string;
  apiRetornou: boolean;

  constructor(private fb: FormBuilder,
    private contaService: ContaService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService) {

    super();

    this.validationMessages = {
      username: { required: 'Informe o Username' },
      password: { required: 'Informe a Password' }
    };
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'];
    super.configurarMensagensValidacaoBase(this.validationMessages);
  }

  ngOnInit(): void {

    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  ngAfterViewInit(): void {
    super.configurarValidacaoFormularioBase(this.formInputElements, this.loginForm);
  }

  login() {
    this.apiRetornou = false;
    if (this.loginForm.dirty && this.loginForm.valid) {
      this.usuario = Object.assign({}, this.usuario, this.loginForm.value);

      this.contaService.login(this.usuario)
        .subscribe(
          sucesso => { this.processarSucesso(sucesso) },
          falha => { this.processarFalha(falha) }
        );
    }

  }

  processarSucesso(response: any) {
    this.loginForm.reset();
    this.errors = [];

    if (response.success == true) {
      this.contaService.LocalStorage.salvarDadosLocaisUsuario();
      let toast = this.toastr.success('Login realizado com Sucesso!', 'Bem vindo!!!');      
      if (toast) {
        this.router.navigate(['/produtos/listar-todos']);
      }
    }
    else {
      let toast = this.toastr.error(response.error);
      if (toast) {
        toast.onHidden.subscribe(() => {
          this.returnUrl
            ? this.router.navigate([this.returnUrl])
            : this.router.navigate(['/conta/login']);
        });
      }
    }
    this.apiRetornou = true;
  }

  processarFalha(fail: any) {
    this.errors = fail.error.errors;
    this.toastr.error('Ocorreu um erro!', 'Opa :(');
    this.apiRetornou = true;
  }
}
